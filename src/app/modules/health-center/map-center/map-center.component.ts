import { Component, AfterViewInit, Output, EventEmitter, signal, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';

export interface SearchEntry {
  address: string;
  date: string;
  lat: number;
  lng: number;
}

interface Suggestion {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: 'nominatim' | 'overpass' | 'custom';
  icon?: string;
}

@Component({
  selector: 'map-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full h-96">
      <!-- Contenedor del mapa con altura fija -->
      <div #mapContainer class="absolute inset-0 rounded shadow-md z-0"></div>

      <!-- Overlay para mostrar estado de carga -->
      @if (isLoading()) {
        <div class="absolute inset-0 flex items-center justify-center bg-base-100/50 z-10 rounded">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }

      <!-- Buscador personalizado con sugerencias -->
      <div class="absolute top-2 right-2 z-10">
        <div class="relative">
          <div class="join w-full">
            <input
              #searchInput
              type="text"
              class="input input-bordered input-sm join-item w-64"
              placeholder="Buscar lugar en Perú..."
              [disabled]="isLoading()"
              [(ngModel)]="searchQuery"
              (focus)="showSuggestions = true"
            />
            <button
              class="btn btn-sm btn-primary join-item"
              (click)="searchLocation(searchQuery)"
              [disabled]="isLoading() || searchQuery.trim().length === 0"
            >
              <i class="material-icons text-xs">search</i>
            </button>
          </div>

          <!-- Panel de sugerencias -->
          @if (showSuggestions && suggestions().length > 0) {
            <div class="absolute mt-1 w-full max-h-60 overflow-y-auto bg-base-100 rounded-md shadow-lg z-20 border border-base-300">
              <ul class="menu p-1 text-sm">
                @for (suggestion of suggestions(); track suggestion.name) {
                  <li>
                    <button
                      class="flex items-center gap-2 py-2 px-3 hover:bg-base-200 rounded-md"
                      (click)="selectSuggestion(suggestion)"
                    >
                      <i class="material-icons text-xs"
                         [class.text-primary]="suggestion.type === 'overpass'"
                         [class.text-secondary]="suggestion.type === 'custom'">
                        {{ suggestion.icon || (suggestion.type === 'overpass' ? 'local_hospital' : 'place') }}
                      </i>
                      <div class="flex-1 truncate">{{ suggestion.displayName }}</div>
                    </button>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>

      <!-- Botones de filtro rápido -->
      <div class="absolute bottom-2 right-2 z-10 flex gap-1">
        <button
          class="btn btn-xs btn-primary"
          [disabled]="isLoading()"
          (click)="findNearbyHealthCenters()"
          title="Mostrar centros de salud cercanos"
        >
          <i class="material-icons text-xs">local_hospital</i>
        </button>
        <button
          class="btn btn-xs btn-secondary"
          [disabled]="isLoading()"
          (click)="clearMarkers()"
          title="Limpiar marcadores"
        >
          <i class="material-icons text-xs">clear</i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MapCenterComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @Output() newSearch = new EventEmitter<SearchEntry>();

  private map?: L.Map;
  private markers: L.Marker[] = [];
  isLoading = signal<boolean>(true);
  suggestions = signal<Suggestion[]>([]);
  searchQuery = '';
  showSuggestions = false;

  // Coordenadas centrales de Perú (Lima)
  private readonly PERU_CENTER: L.LatLngTuple = [-12.0464, -77.0428];

  ngAfterViewInit(): void {
    // Es crucial esperar a que el DOM esté completamente listo
    setTimeout(() => {
      this.initializeMap();
      this.setupSearchAutocomplete();
    }, 500);

    // Cerrar sugerencias cuando se hace clic fuera del componente
    document.addEventListener('click', (event) => {
      if (!event.composedPath().includes(this.searchInput?.nativeElement)) {
        this.showSuggestions = false;
      }
    });
  }

  private setupSearchAutocomplete(): void {
    if (!this.searchInput?.nativeElement) return;

    fromEvent(this.searchInput.nativeElement, 'input')
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.updateSuggestions();
      });
  }

  private updateSuggestions(): void {
    const query = this.searchQuery.trim();

    if (!query || query.length < 2) {
      this.suggestions.set([]);
      return;
    }

    // Para evitar demasiadas solicitudes, esperamos un poco y luego realizamos la búsqueda
    this.fetchNominatimSuggestions(query)
      .then(nominatimResults => {
        // Buscamos además centros de salud que coincidan con la consulta
        this.fetchHealthCentersByName(query)
          .then(overpassResults => {
            // Combinamos ambas fuentes de datos
            const allSuggestions = [
              ...overpassResults,  // Priorizamos centros de salud
              ...nominatimResults.filter(nom =>
                !overpassResults.some(op =>
                  Math.abs(op.lat - nom.lat) < 0.001 &&
                  Math.abs(op.lng - nom.lng) < 0.001
                )
              )
            ].slice(0, 10); // Limitamos a 10 resultados en total

            this.suggestions.set(allSuggestions);
            this.showSuggestions = allSuggestions.length > 0;
          })
          .catch(err => {
            console.error('Error buscando centros de salud:', err);
            // Si falla la búsqueda de Overpass, usamos solo Nominatim
            this.suggestions.set(nominatimResults.slice(0, 10));
            this.showSuggestions = nominatimResults.length > 0;
          });
      })
      .catch(err => {
        console.error('Error buscando sugerencias en Nominatim:', err);
        this.suggestions.set([]);
      });
  }

  private fetchNominatimSuggestions(query: string): Promise<Suggestion[]> {
    const searchQuery = `${query}, Perú`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=pe&addressdetails=1&limit=10`;

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!Array.isArray(data)) return [];

        return data.map(item => {
          // Determinamos el icono según el tipo de lugar
          let icon = 'place';
          if (item.type === 'hospital' ||
              item.type === 'clinic' ||
              (item.display_name &&
               (item.display_name.toLowerCase().includes('hospital') ||
                item.display_name.toLowerCase().includes('clínica') ||
                item.display_name.toLowerCase().includes('centro de salud')))) {
            icon = 'local_hospital';
          } else if (item.type === 'university' ||
                    (item.display_name && item.display_name.toLowerCase().includes('universidad'))) {
            icon = 'school';
          }

          return {
            name: item.osm_id?.toString() || item.place_id?.toString() || '',
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: 'nominatim' as const,
            icon
          };
        });
      });
  }

  private fetchHealthCentersByName(query: string): Promise<Suggestion[]> {
    // Consulta Overpass API por nombre de centro de salud
    // Usando la API de Overpass para buscar hospitales, clínicas o centros de salud
    const overpassQuery = `
      [out:json][timeout:25];
      area["name"="Perú"]->.searchArea;
      (
        node["amenity"="hospital"]["name"~"${query}", i](area.searchArea);
        node["amenity"="clinic"]["name"~"${query}", i](area.searchArea);
        node["healthcare"="hospital"]["name"~"${query}", i](area.searchArea);
        node["healthcare"="clinic"]["name"~"${query}", i](area.searchArea);
        node["healthcare"="doctor"]["name"~"${query}", i](area.searchArea);
        way["amenity"="hospital"]["name"~"${query}", i](area.searchArea);
        way["amenity"="clinic"]["name"~"${query}", i](area.searchArea);
        relation["amenity"="hospital"]["name"~"${query}", i](area.searchArea);
        relation["amenity"="clinic"]["name"~"${query}", i](area.searchArea);
      );
      out center body;
    `;

    // Límite a 5 resultados para no sobrecargar la API
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data.elements || !Array.isArray(data.elements)) return [];

        return data.elements
          .filter(
            (item: { lat: any; lon: any; center: { lat: any; lon: any } }) =>
              (item.lat && item.lon) ||
              (item.center && item.center.lat && item.center.lon),
          )
          .map(
            (item: {
              lat: any;
              center: { lat: any; lon: any };
              lon: any;
              tags: { amenity: string; healthcare: string; name: any };
              id: { toString: () => any };
            }) => {
              // Para ways y relations usamos el centro
              const lat = item.lat || item.center.lat;
              const lng = item.lon || item.center.lon;

              // Determinar tipo detallado para icono
              let icon = 'local_hospital';
              if (item.tags) {
                if (
                  item.tags.amenity === 'clinic' ||
                  item.tags.healthcare === 'clinic'
                ) {
                  icon = 'medical_services';
                } else if (item.tags.healthcare === 'doctor') {
                  icon = 'medication';
                }
              }

              return {
                name: item.id.toString(),
                displayName: item.tags.name || 'Centro médico sin nombre',
                lat,
                lng,
                type: 'overpass' as const,
                icon,
              };
            },
          )
          .slice(0, 5); // Limitamos a 5 resultados de Overpass
      })
      .catch(err => {
        console.error('Error en consulta Overpass:', err);
        return [];
      });
  }

  selectSuggestion(suggestion: Suggestion): void {
    this.searchQuery = suggestion.displayName;
    this.showSuggestions = false;

    const location = {
      center: { lat: suggestion.lat, lng: suggestion.lng },
      name: suggestion.displayName,
      properties: {
        address: {
          name: suggestion.displayName.split(',')[0],
          city: this.getCityFromDisplayName(suggestion.displayName),
          state: this.getStateFromDisplayName(suggestion.displayName)
        }
      },
      type: suggestion.type
    };

    this.handleFoundLocation(location);
  }

  private getCityFromDisplayName(displayName: string): string {
    // Intentamos extraer la ciudad del string de dirección
    const parts = displayName.split(',').map(p => p.trim());
    // Normalmente, la ciudad está en la segunda o tercera posición
    if (parts.length >= 3) {
      return parts[parts.length > 3 ? 2 : 1];
    }
    return "Perú";
  }

  private getStateFromDisplayName(displayName: string): string {
    // Para el departamento, normalmente es el penúltimo antes de "Perú"
    const parts = displayName.split(',').map(p => p.trim());
    if (parts.length >= 4) {
      // Asumimos que el departamento está antes del país
      return parts[parts.length - 2];
    }
    return "Perú";
  }

  private initializeMap(): void {
    // Asegúrate de que el elemento exista
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container element not found');
      return;
    }

    try {
      // Inicializa el mapa con opciones básicas
      this.map = L.map(this.mapContainer.nativeElement, {
        center: this.PERU_CENTER,
        zoom: 6,
        maxZoom: 18,
        minZoom: 4,
        zoomControl: true,
      });

      // Importante: probamos con múltiples proveedores de tiles por si alguno no funciona
      const openStreetMapTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      const cartoDBTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      });

      // Este proveedor tiene mejor cobertura para Perú
      const esriTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      });

      // Agregamos múltiples capas y creamos un control para cambiar entre ellas
      const baseMaps = {
        "Esri (Recomendado)": esriTiles,
        "OpenStreetMap": openStreetMapTiles,
        "CartoDB": cartoDBTiles
      };

      // Cambiamos a Esri por defecto que tiene mejor cobertura
      esriTiles.addTo(this.map);

      // Agregamos el control de capas
      L.control.layers(baseMaps).addTo(this.map);

      // Agregamos un control de escala
      L.control.scale({imperial: false, metric: true}).addTo(this.map);

      // Aseguramos que el mapa se renderice correctamente
      this.map.invalidateSize();

      // Determinamos cuando el mapa está completamente cargado
      this.map.on('load', () => {
        console.log('Mapa cargado completamente');
        this.isLoading.set(false);
      });

      // Como alternativa, usamos un timeout para asegurar que el indicador de carga desaparezca
      setTimeout(() => {
        this.isLoading.set(false);
        // Volvemos a invalidar el tamaño para asegurar que todo se visualice correctamente
        this.map?.invalidateSize();
      }, 1500);

    } catch (error) {
      console.error('Error initializing map:', error);
      this.isLoading.set(false);
    }
  }

  // Buscar centros de salud cercanos a la vista actual
  findNearbyHealthCenters(): void {
    if (!this.map) return;

    this.isLoading.set(true);

    const bounds = this.map.getBounds();
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    // Consulta para encontrar centros de salud en el área visible
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](${south},${west},${north},${east});
        node["amenity"="clinic"](${south},${west},${north},${east});
        node["healthcare"="hospital"](${south},${west},${north},${east});
        node["healthcare"="clinic"](${south},${west},${north},${east});
        node["healthcare"="doctor"](${south},${west},${north},${east});
        way["amenity"="hospital"](${south},${west},${north},${east});
        way["amenity"="clinic"](${south},${west},${north},${east});
        relation["amenity"="hospital"](${south},${west},${north},${east});
        relation["amenity"="clinic"](${south},${west},${north},${east});
      );
      out center body;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.isLoading.set(false);

        if (!data.elements || !Array.isArray(data.elements) || data.elements.length === 0) {
          alert('No se encontraron centros de salud en esta área. Intenta acercar el mapa o buscar en otra ubicación.');
          return;
        }

        // Limpiamos marcadores existentes
        this.clearMarkers();

        // Agregamos los nuevos marcadores
        data.elements.forEach(
          (item: {
            lat: any;
            lon: any;
            center: { lat: any; lon: any };
            tags: { name: string; amenity: string; healthcare: string };
          }) => {
            if (
              (!item.lat || !item.lon) &&
              (!item.center || !item.center.lat || !item.center.lon)
            ) {
              return; // Skip elements without coordinates
            }

            const lat = item.lat || item.center.lat;
            const lng = item.lon || item.center.lon;
            const name = item.tags?.name || 'Centro médico sin nombre';

            // Crear icono según el tipo
            let iconUrl = 'assets/icons/hospital.png';
            let iconClass = 'text-primary';

            if (item.tags) {
              if (
                item.tags.amenity === 'clinic' ||
                item.tags.healthcare === 'clinic'
              ) {
                iconClass = 'text-secondary';
              }
            }

            // Crear marcador
            const marker = L.marker([lat, lng], {
              title: name,
            });

            marker.bindPopup(this.createHealthCenterPopup(item));
            marker.addTo(this.map!);

            // Guardar referencia para limpieza posterior
            this.markers.push(marker);
          },
        );

        // Si hay resultados, enviamos el primero como evento
        if (data.elements.length > 0) {
          const first = data.elements[0];
          const lat = first.lat || first.center.lat;
          const lng = first.lon || first.center.lon;
          const name = first.tags?.name || 'Centro médico cercano';

          // Emitimos el evento pero sin cambiar la vista del mapa
          const entry: SearchEntry = {
            address: name + ', cerca de su ubicación, Perú',
            date: new Date().toISOString(),
            lat,
            lng
          };

          this.newSearch.emit(entry);
        }
      })
      .catch(err => {
        console.error('Error buscando centros de salud cercanos:', err);
        this.isLoading.set(false);
        alert('Error al buscar centros de salud. Por favor, intente de nuevo.');
      });
  }

  // Crear popup informativo para centros de salud
  private createHealthCenterPopup(item: any): string {
    const name = item.tags?.name || 'Centro médico sin nombre';
    const type = this.getHealthCenterType(item);
    const address = item.tags?.['addr:street'] ?
                    `${item.tags?.['addr:street']} ${item.tags?.['addr:housenumber'] || ''}` :
                    'Dirección no disponible';
    const phone = item.tags?.phone || item.tags?.['contact:phone'] || 'No disponible';
    const website = item.tags?.website ?
                    `<a href="${item.tags.website}" target="_blank" class="text-primary underline">Sitio web</a>` :
                    'No disponible';

    return `
      <div class="p-2">
        <h3 class="font-bold text-lg">${name}</h3>
        <p class="text-sm text-gray-600">${type}</p>
        <div class="my-2 border-t border-gray-200"></div>
        <div class="text-sm space-y-1">
          <p><strong>Dirección:</strong> ${address}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Web:</strong> ${website}</p>
        </div>
        <div class="mt-2 flex justify-end">
          <button
            class="text-xs text-primary"
            onclick="window.open('https://www.google.com/maps/search/?api=1&query=${item.lat || item.center.lat},${item.lon || item.center.lon}', '_blank')"
          >
            Ver en Google Maps
          </button>
        </div>
      </div>
    `;
  }

  // Determinar tipo de centro de salud
  private getHealthCenterType(item: any): string {
    if (!item.tags) return 'Centro médico';

    if (item.tags.amenity === 'hospital' || item.tags.healthcare === 'hospital') {
      return 'Hospital';
    }

    if (item.tags.amenity === 'clinic' || item.tags.healthcare === 'clinic') {
      return 'Clínica';
    }

    if (item.tags.healthcare === 'doctor') {
      return 'Consultorio médico';
    }

    return 'Centro de salud';
  }

  // Limpiar marcadores existentes
  clearMarkers(): void {
    if (!this.map) return;

    this.markers.forEach(marker => {
      this.map?.removeLayer(marker);
    });

    this.markers = [];
  }

  // Método para buscar ubicaciones
  searchLocation(query: string): void {
    if (!query.trim()) return;
    this.showSuggestions = false;
    this.isLoading.set(true);

    // Añadimos "Perú" para mejorar los resultados
    const searchQuery = `${query}, Perú`;

    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=pe&addressdetails=1&limit=1`)
      .then(response => response.json())
      .then(data => {
        this.isLoading.set(false);

        if (data && data.length > 0) {
          const result = data[0];
          this.handleFoundLocation({
            center: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
            name: result.display_name,
            properties: { address: result.address },
            type: 'nominatim'
          });
        } else {
          alert('No se encontró la ubicación. Intente con una búsqueda más específica.');
        }
      })
      .catch(err => {
        console.error('Error en la búsqueda:', err);
        this.isLoading.set(false);
        alert('Error al buscar la ubicación. Por favor, intente de nuevo.');
      });
  }

  // Método unificado para manejar ubicaciones encontradas
  private handleFoundLocation(location: any): void {
    const { lat, lng } = location.center;
    const latlng: L.LatLngTuple = [lat, lng];

    // Zoom a la ubicación
    this.map?.setView(latlng, 15);

    // Limpiar marcadores anteriores
    this.clearMarkers();

    // Seleccionar icono según tipo
    let iconHtml = `
      <i class="material-icons" style="font-size: 24px; color: #3498db;">
        ${location.type === 'overpass' ? 'local_hospital' : 'place'}
      </i>`;

    // Crear elemento HTML para el icono
    const iconDiv = document.createElement('div');
    iconDiv.innerHTML = iconHtml;
    iconDiv.className = 'marker-icon';

    // Crear icono personalizado
    const icon = L.divIcon({
      html: iconHtml,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    // Añadir marcador
    const marker = L.marker(latlng, { icon }).addTo(this.map!)
      .bindPopup(this.formatPeruAddress(location))
      .openPopup();

    // Guardar referencia
    this.markers.push(marker);

    // Crear entrada de historial
    const entry: SearchEntry = {
      address: this.formatPeruAddress(location),
      date: new Date().toISOString(),
      lat,
      lng
    };

    // Emitir al componente padre
    this.newSearch.emit(entry);
  }

  // Método para formatear direcciones de Perú
  private formatPeruAddress(geocode: any): string {
    try {
      // Validación básica
      if (!geocode) return 'Ubicación en Perú';

      if (geocode.properties && geocode.properties.address) {
        const address = geocode.properties.address;

        // Construir dirección formateada con prioridad en componentes relevantes
        const components = [];

        // Añadir dirección específica si está disponible
        if (address.road) components.push(address.road);
        if (address.house_number) components.push(address.house_number);

        // Añadir distrito/barrio
        if (address.suburb) components.push(address.suburb);
        else if (address.neighbourhood) components.push(address.neighbourhood);
        else if (address.district) components.push(address.district);

        // Añadir ciudad/provincia
        if (address.city) components.push(address.city);
        else if (address.town) components.push(address.town);
        else if (address.county) components.push(address.county);

        // Añadir departamento
        if (address.state) components.push(address.state);

        // Siempre añadir Perú al final
        components.push('Perú');

        return components.join(', ');
      }

      // Verificamos si hay name
      if (geocode.name) {
        return geocode.name + ', Perú';
      }

      return 'Ubicación en Perú';
    } catch (error) {
      console.error('Error formateando dirección:', error);
      return 'Ubicación en Perú';
    }
  }

  // Método público para forzar el reajuste del mapa
  public refreshMap(): void {
    if (this.map) {
      // Necesitamos esperar a que el DOM se actualice
      setTimeout(() => {
        console.log('Refrescando mapa');
        this.map?.invalidateSize({animate: true});
      }, 500);
    }
  }
}
