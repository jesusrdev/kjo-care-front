import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mood-heatmap',
  imports: [CommonModule],
  templateUrl: './mood-heatmap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodHeatmapComponent {
  daysArray = signal<number[]>(Array.from({ length: 35 }, (_, i) => i));


  getDayColor(day: number): string {
    if (day % 7 === 0) return 'transparent';
    if (day % 5 === 0) return '#68D391';
    if (day % 4 === 0) return '#9F7AEA';
    if (day % 3 === 0) return '#FBD38D';
    if (day % 2 === 0) return '#90CDF4';
    return '#F6AD55';
  }
}
