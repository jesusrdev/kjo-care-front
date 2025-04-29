import { Component, AfterViewInit, Output, EventEmitter, signal, ElementRef, ViewChild, inject } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { CommonModule } from '@angular/common';

export interface SearchEntry {
  address: string;
  date: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'map-center',
  standalone: true,
  imports: [CommonModule],
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
    </div>
  `,
})
export class MapCenterComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLElement>;
  @Output() newSearch = new EventEmitter<SearchEntry>();

  private map?: L.Map;
  isLoading = signal<boolean>(true);

  ngAfterViewInit(): void {
    // Retrasa ligeramente la inicialización para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  private initializeMap(): void {
    // Asegúrate de que el elemento exista
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container element not found');
      return;
    }

    try {
      // Inicializa el mapa usando el elemento de referencia
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [-12.05, -77.03], // Lima, Perú como centro predeterminado
        zoom: 13,
        attributionControl: true
      });

      // Añade el layer de tiles con crossOrigin para evitar problemas CORS
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        crossOrigin: ''
      }).addTo(this.map);

      // Forzar un reajuste del mapa después de cargar
      this.map.invalidateSize();

      // Configurar el geocoder
      const geocoderControl = (L.Control as any).geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Buscar ubicación...',
        errorMessage: 'No se encontró la dirección',
        suggestMinLength: 3
      });

      geocoderControl
        .on('markgeocode', (e: any) => {
          const { lat, lng } = e.geocode.center;

          // Zoom a la ubicación
          this.map?.setView([lat, lng], 15);

          // Añadir marcador
          L.marker([lat, lng]).addTo(this.map!)
            .bindPopup(e.geocode.name)
            .openPopup();

          // Crear entrada de historial
          const entry: SearchEntry = {
            address: e.geocode.name,
            date: new Date().toISOString(),
            lat,
            lng
          };

          // Emitir al componente padre
          this.newSearch.emit(entry);
        })
        .addTo(this.map);

      // Espera a que las tiles carguen antes de ocultar el indicador de carga
      setTimeout(() => {
        this.map?.invalidateSize();
        this.isLoading.set(false);
      }, 500);

    } catch (error) {
      console.error('Error initializing map:', error);
      this.isLoading.set(false);
    }
  }

  // Método público para forzar el reajuste del mapa cuando cambia la visibilidad
  public refreshMap(): void {
    if (this.map) {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 0);
    }
  }
}
