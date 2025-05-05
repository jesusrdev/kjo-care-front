import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
interface Entry { address: string; date: string; lat: number; lng: number; }

@Component({
  selector: 'app-history',
  imports: [DatePipe],
  templateUrl: './history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  history: Entry[] = JSON.parse(localStorage.getItem('searchHistory') || '[]');
}
