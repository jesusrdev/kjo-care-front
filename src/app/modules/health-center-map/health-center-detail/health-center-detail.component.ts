import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import { ModalOpenButtonComponent } from '../../../shared/components/modal-open-button/modal-open-button.component';
import { HealthCenterService } from '../../../core/services/health-center.service';

@Component({
  selector: 'health-center-detail',
  templateUrl: './health-center-detail.component.html',
  imports: [
    ModalOpenButtonComponent,
    DatePipe
  ]
})
export class HealthCenterDetailComponent implements OnInit {
  healthCenterService = inject(HealthCenterService);

  healthCenter = computed(() => this.healthCenterService.selectedCenter());
  map: Map | null = null;

  constructor() {
    effect(() => {
      // Cada vez que cambie el centro de salud seleccionado, inicializamos el mapa
      const center = this.healthCenterService.selectedCenter();
      if (center && this.map) {
        this.updateMap(center.latitude, center.longitude);
      }
    });
  }

  ngOnInit(): void {
    // Inicializamos el mapa después que el componente está listo
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  private initMap(): void {
    const center = this.healthCenterService.selectedCenter();

    if (!center) return;

    if (this.map) {
      this.map.setTarget(undefined);
    }

    // Crear capa base OSM
    const osmLayer = new TileLayer({
      source: new OSM()
    });

    // Crear capa para el marcador
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource
    });

    // Crear mapa
    this.map = new Map({
      target: 'detailMap',
      layers: [osmLayer, markerLayer],
      view: new View({
        center: fromLonLat([center.longitude, center.latitude]),
        zoom: 15
      })
    });

    // Añadir marcador
    this.addMarker(center.latitude, center.longitude);
  }

  private updateMap(lat: number, lng: number): void {
    if (!this.map) return;

    // Actualizar la vista del mapa
    this.map.getView().setCenter(fromLonLat([lng, lat]));

    // Actualizar marcador
    this.addMarker(lat, lng);
  }

  private addMarker(lat: number, lng: number): void {
    if (!this.map) return;

    // Crear marcador
    const marker = new Feature({
      geometry: new Point(fromLonLat([lng, lat]))
    });

    const vectorSource = new VectorSource({
      features: [marker]
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.8
        })
      })
    });

    this.map.getLayers().clear();
    this.map.addLayer(new TileLayer({ source: new OSM() }));
    this.map.addLayer(vectorLayer);
  }
}
