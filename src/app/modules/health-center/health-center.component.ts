import { ChangeDetectionStrategy, Component, ViewChild, AfterViewInit, signal, OnInit } from '@angular/core';
import { MapCenterComponent, SearchEntry } from './map-center/map-center.component';
import { CenterCardComponent } from './center-card/center-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-center',
  standalone: true,
  imports: [CommonModule, MapCenterComponent, CenterCardComponent],
  templateUrl: './health-center.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HealthCenterComponent implements OnInit, AfterViewInit {
  @ViewChild(MapCenterComponent) mapComponent!: MapCenterComponent;

  history = signal<SearchEntry[]>([]);

  ngOnInit() {
    this.loadHistory();
  }

  ngAfterViewInit() {
    // Cuando la vista ha sido inicializada, refresca el mapa
    // Incrementamos el tiempo para asegurarnos que el DOM esté completamente listo
    setTimeout(() => {
      if (this.mapComponent) {
        console.log('Llamando a refreshMap desde el componente padre');
        this.mapComponent.refreshMap();
      } else {
        console.error('MapComponent no encontrado');
      }
    }, 800);
  }

  // Carga inicial desde localStorage
  private loadHistory() {
    try {
      const raw = localStorage.getItem('searchHistory') || '[]';
      this.history.set(JSON.parse(raw));
    } catch (error) {
      console.error('Error loading search history:', error);
      this.history.set([]);
    }
  }

  // Recibe cada nueva búsqueda del MapCenterComponent
  onNewSearch(entry: SearchEntry) {
    // Usa la API de señales para actualizar la lista
    this.history.update(current => {
      const updated = [entry, ...current];
      // Limita el historial a 20 entradas para no saturar localStorage
      const limited = updated.slice(0, 20);

      // Guarda en localStorage
      localStorage.setItem('searchHistory', JSON.stringify(limited));

      return limited;
    });
  }

  // Limpia el historial
  clearHistory() {
    this.history.set([]);
    localStorage.removeItem('searchHistory');
  }
}
