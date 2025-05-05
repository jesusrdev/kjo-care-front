import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SearchEntry } from '../map-center/map-center.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'center-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './center-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CenterCardComponent {
  @Input() entry!: SearchEntry;
}
