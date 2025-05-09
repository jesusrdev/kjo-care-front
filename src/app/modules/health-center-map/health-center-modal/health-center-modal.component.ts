import { Component, OnInit, effect, inject, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import { HealthCenterService } from '../../../core/services/health-center.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormUtils } from '../../../shared/utils/form-utils';
import { HealthCenterRequest } from '../../../core/interfaces/health-center-http.interface';

@Component({
  selector: 'health-center-modal',
  templateUrl: './health-center-modal.component.html',
  imports: [
    ReactiveFormsModule
  ]
})
export class HealthCenterModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private healthCenterService = inject(HealthCenterService);
  private toastService = inject(ToastService);

  reload = output();

  formUtils = FormUtils;
  title = signal('Añadir centro de salud');
  nameButton = signal('Guardar');

  // Mapa para selección de coordenadas
  coordinatesMap: Map | null = null;
  markerSource = new VectorSource();
  markerLayer = new VectorLayer({
    source: this.markerSource
  });
  selectedLat: number | null = null;
  selectedLng: number | null = null;

  healthCenterForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required]],
    phone: [''],
    latitude: [null, [Validators.required]],
    longitude: [null, [Validators.required]]
  });

  constructor() {
    effect(() => {
      this.title.set('Añadir centro de salud');
      this.nameButton.set('Guardar');

      const selectedCenter = this.healthCenterService.selectedCenter();
      if (selectedCenter.id > 0) {
        this.title.set('Editar centro de salud');
        this.nameButton.set('Actualizar');
      }

      this.healthCenterForm.patchValue({
        name: selectedCenter.name,
        address: selectedCenter.address,
        phone: selectedCenter.phone,
        latitude: selectedCenter.latitude,
        longitude: selectedCenter.longitude
      });

      // Actualizar las coordenadas seleccionadas
      this.selectedLat = selectedCenter.latitude;
      this.selectedLng = selectedCenter.longitude;
    });
  }

  ngOnInit(): void {
    // El mapa se inicializará cuando se abra el modal de coordenadas
  }

  openCoordinatesModal(): void {
    // Abrir el modal de coordenadas
    const modal = document.getElementById('modal_coordinates_selector') as HTMLDialogElement;
    modal.showModal();

    // Inicializar el mapa después de abrir el modal
    setTimeout(() => {
      this.initCoordinatesMap();
    }, 300);
  }

  private async initCoordinatesMap(): Promise<void> {
    // Si ya existe un mapa, lo eliminamos para crear uno nuevo
    if (this.coordinatesMap) {
      this.coordinatesMap.dispose();
    }


    // Obtener coordenadas actuales del formulario o usar valores por defecto (Lima, Perú)
    let lat = this.healthCenterForm.value.latitude || -12.0464;
    let lng = this.healthCenterForm.value.longitude || -77.0428;

    if (this.healthCenterService.selectedCenter().id === 0) {
      const userCoords = await this.getUserLocation();
      lat = userCoords.latitude;
      lng = userCoords.longitude;
    }

    // Configurar estilo para el marcador
    this.markerLayer.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'https://openlayers.org/en/latest/examples/data/icon.png',
        scale: 0.8
      })
    }));

    // Inicializar el mapa con OpenLayers
    this.coordinatesMap = new Map({
      target: 'coordinatesMap',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.markerLayer
      ],
      view: new View({
        center: fromLonLat([lng, lat]),
        zoom: 15
      })
    });

    // Añadir marcador inicial si hay coordenadas
    if (lat && lng && this.healthCenterService.selectedCenter().id > 0) {
      this.addMarker(lat, lng);
    }

    // Añadir evento de clic para seleccionar nuevas coordenadas
    this.coordinatesMap.on('click', (evt) => {
      const coordinates = evt.coordinate;
      const lonLat = toLonLat(coordinates);

      this.selectedLng = lonLat[0];
      this.selectedLat = lonLat[1];

      this.addMarker(this.selectedLat, this.selectedLng);
    });
  }

  private addMarker(lat: number, lng: number): void {
    // Limpiar marcadores anteriores
    this.markerSource.clear();

    // Crear nuevo marcador en la posición indicada
    const marker = new Feature({
      geometry: new Point(fromLonLat([lng, lat]))
    });

    // Añadir marcador a la capa
    this.markerSource.addFeature(marker);
  }

  saveCoordinates(): void {
    if (this.selectedLat && this.selectedLng) {
      // Actualizar el formulario con las coordenadas seleccionadas
      this.healthCenterForm.patchValue({
        latitude: this.selectedLat,
        longitude: this.selectedLng
      });

      // Cerrar el modal de coordenadas
      const modal = document.getElementById('modal_coordinates_selector') as HTMLDialogElement;
      modal.close();
    }
  }

  onSubmit(): void {
    if (this.healthCenterForm.invalid) {
      this.healthCenterForm.markAllAsTouched();
      console.log('Formulario inválido', this.healthCenterForm.errors);
      return;
    }

    const request: HealthCenterRequest = {
      name: this.healthCenterForm.value.name!,
      address: this.healthCenterForm.value.address!,
      phone: this.healthCenterForm.value.phone || '',
      latitude: this.healthCenterForm.value.latitude!,
      longitude: this.healthCenterForm.value.longitude!
    };

    if (this.healthCenterService.selectedCenter().id > 0) {
      // Actualizar centro de salud existente

      this.healthCenterService.update(request, this.healthCenterService.selectedCenter().id).subscribe({
        next: () => {
          this.toastService.addToast({
            message: 'Centro de salud actualizado correctamente',
            type: 'success',
            duration: 4000
          });

          this.reload.emit();
          this.healthCenterForm.reset();
          this.resetForm();
        },
        error: (error) => {
          this.toastService.addToast({
            message: 'Error al actualizar centro de salud',
            type: 'error',
            duration: 4000
          });
        }
      });
    } else {
      // Crear nuevo centro de salud
      this.healthCenterService.create(request).subscribe({
        next: () => {
          this.toastService.addToast({
            message: 'Centro de salud creado correctamente',
            type: 'success',
            duration: 4000
          });

          this.reload.emit();
          this.resetForm();
        },
        error: (error) => {
          this.toastService.addToast({
            message: 'Error al crear centro de salud',
            type: 'error',
            duration: 4000
          });
        }
      });
    }
  }

  private resetForm(): void {
    this.healthCenterForm.reset();
    this.selectedLat = null;
    this.selectedLng = null;
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
}
