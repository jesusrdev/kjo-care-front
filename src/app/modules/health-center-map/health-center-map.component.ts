import { Component, effect, inject, OnInit, signal } from '@angular/core';
import Papa from 'papaparse';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import Overlay from 'ol/Overlay';
import { HealthCenterService } from '../../core/services/health-center.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CenterGridComponent } from './center-grid/center-grid.component';
import { HealthCenterResponse } from '../../core/interfaces/health-center-http.interface';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-health-center-map',
  templateUrl: './health-center-map.component.html',
  styleUrls: ['./health-center-map.component.css'],
  imports: [
    CenterGridComponent
  ]
})
export default class HealthCenterMapComponent implements OnInit {
  map!: Map;
  popup!: Overlay;

  healthCenters = signal<any[]>([]);
  searchQuery = signal('');
  filteredCenters = signal<HealthCenterResponse[]>([]);
  centersLength = signal(0);

  dataType = signal<'none' | 'csv' | 'api' | 'local'>('none');

  centersService = inject(HealthCenterService);
  toastService = inject(ToastService);

  centers = rxResource({
    loader: () => this.centersService.getAll()
  });

  constructor() {
    effect(() => {
      switch (this.dataType()) {
        case 'none':
          break;
        case 'api':
          if (this.centers.error()) {
            this.toastService.addToast({
              type: 'error',
              message: 'Error al cargar centros de salud',
              duration: 4000
            });
          } else if (this.centers.value()!.length > 0) {
            this.addMarkersToMap(this.centers.value()!);
            this.healthCenters.set(this.centers.value()!);
            this.filteredCenters.set(this.centers.value()!);
          }
          break;
      }
    });

  }

  ngOnInit() {
    setTimeout(() => {
      this.initMap();
      this.setupPopup();
    }, 100); // Pequeño retraso para asegurar que el DOM esté listo
  }

  initMap() {
    // Centro inicial en Lima, Perú
    this.map = new Map({
      target: 'map',
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat([-77.0428, -12.0464]), // [longitud, latitud]
        zoom: 12
      })
    });
  }

  setupPopup() {
    // Crear componente Angular para el popup
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    popupElement.innerHTML = `
      <div id="popup-content"></div>
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    `;

    // Añadir al DOM usando Angular
    document.body.appendChild(popupElement);

    const popupContent = document.getElementById('popup-content');
    const popupCloser = document.getElementById('popup-closer');

    // Crear overlay para el popup (sin la opción que causa error)
    this.popup = new Overlay({
      element: popupElement,
      autoPan: true
      // Eliminamos autoPanAnimation que causa el error
    });
    this.map.addOverlay(this.popup);

    // Evento para cerrar el popup
    if (popupCloser) {
      popupCloser.addEventListener('click', () => {
        this.popup.setPosition(undefined);
        popupCloser.blur();
        return false;
      });
    }

    // Evento para mostrar el popup al hacer clic en un marcador
    this.map.on('click', (evt) => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (feature && popupContent) {
        const geometry = feature.getGeometry() as Point;
        if (!geometry) return;

        const coordinates = geometry.getCoordinates();
        const properties = feature.get('properties') || {};

        // Verificar si tenemos las propiedades necesarias
        if (properties['name']) {
          // Construir contenido HTML con la información del centro de salud
          popupContent.innerHTML = `
          <div class="bg-base-100 p-4 rounded-lg shadow-lg max-w-96 aspect-[16/10]">
            <h3 class="text-lg font-bold">${properties['name']}</h3>
            <div class="mt-2 overflow-y-scroll max-h-64">
              <p><strong>Institución:</strong> ${properties['institution']}</p>
              <p><strong>Categoría:</strong> ${properties['category']}</p>
              <p><strong>Dirección:</strong> ${properties['address']}</p>
              <p><strong>Teléfono:</strong> ${properties['phone']}</p>
              ${properties['website'] ? `<p><strong>Web:</strong> <a href="${properties['website']}" target="_blank">${properties['website']}</a></p>` : ''}
              ${properties['horario'] ? `<p><strong>Horario:</strong> ${properties['horario']}</p>` : ''}
              ${properties['director'] ? `<p><strong>Director:</strong> ${properties['director']}</p>` : ''}
            </div>
          </div>
          `;
          this.popup.setPosition(coordinates);
        }
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.dataType.set('csv');
      this.filterCsv(file);
    }
  }

  filterCsv(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log('Datos CSV cargados:', result.data);

        const filteredCenters: any[] = result.data.filter((center: any) => {
          // Asegurarse de que los campos existan y sean números válidos
          const lat = this.getValidCoordinate(center.NORTE || center.Norte || center.Latitud || center.LAT);
          const lon = this.getValidCoordinate(center.ESTE || center.Este || center.Longitud || center.LON);

          // Si ambas coordenadas son válidas
          return lat !== null && lon !== null;
        });

        console.log(`Centros filtrados: ${filteredCenters.length} de ${result.data.length}`);
        console.log(filteredCenters);
        this.healthCenters.set(filteredCenters);
        this.addMarkersToMap(filteredCenters);
      },
      error: (error) => {
        console.error('Error al parsear el CSV:', error);
      }
    });
  }

  async useLocalData() {
    // Get file of /centers.csv
    const file = await this.centersService.getLocalData();
    this.filterCsv(file);
    this.dataType.set('local');
  }

  // Intenta obtener una coordenada válida de varios formatos posibles
  getValidCoordinate(value: any): number | null {
    if (!value) return null;

    // Intentar convertir a número
    const numValue = parseFloat(String(value).replace(',', '.'));
    if (isNaN(numValue)) return null;

    // Verificar si es una coordenada válida (aproximadamente en el rango de Perú)
    // Para latitud: aproximadamente entre -18 y 0
    // Para longitud: aproximadamente entre -82 y -68
    if (numValue < -90 || numValue > 90) {
      console.warn('Coordenada fuera de rango normal:', numValue);
    }

    return numValue;
  }

  addMarkersToMap(centers: any[]) {
    console.log('Añadiendo marcadores:', centers.length);

    const features = centers.map((center) => {
      // Intentar obtener las coordenadas desde varios campos posibles
      const lat = this.getValidCoordinate(center.ESTE || center.latitude || center.LAT);
      const lon = this.getValidCoordinate(center.NORTE || center.longitude || center.LON);

      if (lat === null || lon === null) {
        console.warn('Coordenadas inválidas para:', center['Nombre del establecimiento']);
        return null;
      }

      // Crear la feature con los datos completos
      // CORREGIDO: Invertimos lat y lon según tu comentario, ahora [lat, lon]
      const feature = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        properties: {
          ['name']: center['Nombre del establecimiento'] || center['name'] || 'Sin nombre',
          ['category']: center['Categoria'] || '--------',
          ['address']: center['Direccion'] || center['address'] || '--------',
          ['phone']: center['Telefono'] || center['phone'] || 'No especificado',
          ['institution']: center['Institucion'] || 'No especificada',
          ['website']: center['Pagina web'] || '',
          ['horario']: center['Horario'] || 'No especificado',
          ['director']: center['Director Medico y/o Responsable de la Atencion de Salud'] || 'No especificado',
          ['allData']: center // Guardamos todos los datos para referencia
        }
      });

      return feature;
    }).filter(feature => feature !== null) as Feature[];

    console.log('Features creadas:', features.length);

    const vectorSource = new VectorSource({
      features: features
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'https://openlayers.org/en/latest/examples/data/icon.png', // Icono de OpenLayers
          scale: 0.8
        })
      })
    });

    // Limpiar capas anteriores y añadir las nuevas
    this.map.getLayers().clear();
    this.map.addLayer(new TileLayer({ source: new OSM() }));
    this.map.addLayer(vectorLayer);

    // Ajustar la vista para mostrar todos los marcadores
    if (features.length > 0) {
      const extent = vectorSource.getExtent();
      this.map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 15
      });

      this.centersLength.set(features.length);
    }
  }

  filterCenters() {
    console.log('Filtrando con query:', this.searchQuery());
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      this.addMarkersToMap(this.healthCenters());
      return;
    }

    const filteredCenters = this.healthCenters().filter((center) => {
      const name = (center['Nombre del establecimiento'] || center['NOMBRE_DE_ESTABLECIMIENTO'] || center.name || '').toLowerCase();
      const category = (center['Categoría'] || center['CATEGORIA'] || '').toLowerCase();
      const address = (center['Dirección'] || center['DIRECCION'] || center.address || '').toLowerCase();

      return name.includes(query) || category.includes(query) || address.includes(query);
    });

    console.log(`Resultados filtrados: ${filteredCenters.length}`);
    this.addMarkersToMap(filteredCenters);
    if (this.dataType() == 'api') {
      this.filteredCenters.set(filteredCenters);
    }
  }

  getUserLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }),
          (error) => reject(error)
        );
      }
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async findNearbyCenters(radius: number = 5) {
    try {
      const userCoords = await this.getUserLocation();
      console.log('Ubicación del usuario:', userCoords);

      const nearbyCenters = this.healthCenters().filter((center) => {
        const lat = this.getValidCoordinate(center.ESTE || center.Este || center.latitude || center.LAT);
        const lon = this.getValidCoordinate(center.NORTE || center.longitude || center.LON);

        if (lat === null || lon === null) return false;

        const distance = this.calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          lat,
          lon
        );

        center.distance = distance.toFixed(2); // Guardar la distancia para mostrarla
        return distance <= radius;
      });

      console.log(`Centros cercanos: ${nearbyCenters.length}`);

      // Ordenar por distancia
      nearbyCenters.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

      this.addMarkersToMap(nearbyCenters);
      if (this.dataType() == 'api') {
        this.filteredCenters.set(nearbyCenters);
      }

      // Centrar el mapa en la ubicación del usuario
      this.map.getView().setCenter(fromLonLat([userCoords.longitude, userCoords.latitude]));
      this.map.getView().setZoom(14);

    } catch (error) {
      console.error('Error al obtener la ubicación del usuario:', error);
      alert('No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación en tu navegador.');
    }
  }

  clearFilters() {
    this.searchQuery.set('');
    if (this.dataType() == 'api' && this.centers.value()) {
      this.addMarkersToMap(this.centers.value()!);
      this.filteredCenters.set(this.centers.value()!);
    } else {
      this.addMarkersToMap(this.healthCenters());
    }
  }

  useDataType(type: 'none' | 'csv' | 'api' | 'local') {
    this.dataType.set(type);
  }
}
