import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodAnalyticsResponse } from '../../core/interfaces/mood-analytics.response';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../core/services/analytics.service';

interface Mood {
  label: string;
  percent: number;
  entries: number;
  delta: number;
  color?: string;
}

const MOOD_COLORS: Record<string, string> = {
  Happy: '#68D391',
  Neutral: '#90CDF4',
  Sad: '#9F7AEA',
  Anxious: '#FBD38D',
  Energetic: '#F6AD55',
  Default: '#A3A3A3',
};

const STANDARD_MOODS = ['Happy', 'Neutral', 'Sad', 'Anxious', 'Energetic'];

@Component({
  selector: 'mood-analytics',
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-analytics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodAnalyticsComponent {
  private moodAnalytics = inject(AnalyticsService);

  analyticsResource = rxResource({
    loader: () => this.moodAnalytics.getMoodAnalytics(this.getMonthsForRange()),
  });

  moods = signal<Mood[]>([]);

  ranges = signal<string[]>([
    'Last Week',
    'Last Month',
    'Last 3 Months',
    'Last Year',
  ]);
  selectedRange = signal<string>('Last 3 Months');

  tabs = signal<string[]>(['Mood Heatmap', 'Mood Distribution', 'Mood Trends']);
  activeTab = signal<string>('Mood Heatmap');

  daysArray = signal<number[]>(Array.from({ length: 35 }, (_, i) => i));

  constructor() {
    effect(() => {
      const data = this.analyticsResource.value();
      if (data) {
        this.processMoodData(data);
      }
    });
  }

  private processMoodData(data: MoodAnalyticsResponse): void {
    const newMoods: Mood[] = [];

    for (const moodLabel of STANDARD_MOODS) {
      const percent =
        data.moodPercentages?.[
          moodLabel as keyof typeof data.moodPercentages
        ] || 0;
      const entries =
        data.moodCounts?.[moodLabel as keyof typeof data.moodCounts] || 0;

      newMoods.push({
        label: moodLabel,
        percent: Number(percent.toFixed(1)),
        entries,
        delta: 0,
        color: MOOD_COLORS[moodLabel],
      });
    }

    this.moods.set(newMoods);
  }

  updateRange(range: string): void {
    this.selectedRange.set(range);
    this.analyticsResource.reload();
  }

  private getMonthsForRange(): number {
    switch (this.selectedRange()) {
      case 'Last Week':
        return 0.25;
      case 'Last Month':
        return 1;
      case 'Last 3 Months':
        return 3;
      case 'Last Year':
        return 12;
      default:
        return 3;
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  export(): void {
    console.log('Exportando datos de Mood Analytics...');
    alert('Exportación de datos iniciada');
  }

  getDayColor(day: number): string {
    if (day % 7 === 0) return 'transparent';
    if (day % 5 === 0) return '#68D391';
    if (day % 4 === 0) return '#9F7AEA';
    if (day % 3 === 0) return '#FBD38D';
    if (day % 2 === 0) return '#90CDF4';
    return '#F6AD55';
  }
}
