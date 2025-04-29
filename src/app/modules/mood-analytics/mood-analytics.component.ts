import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoodAnalyticsResponse } from '../../core/interfaces/mood-analytics.response';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../core/services/analytics.service';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

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
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './mood-analytics.component.html',
  styleUrl: './mood-analytics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodAnalyticsComponent implements OnInit {
  private moodAnalytics = inject(AnalyticsService);
  private router = inject(Router);

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

  tabs = signal<{ name: string; path: string; icon: string }[]>([
    { name: 'Mood Heatmap', path: 'mood-heatmap', icon: 'grid_view' },
    { name: 'Mood Distribution', path: 'mood-distribution', icon: 'pie_chart' },
    { name: 'Mood Trends', path: 'mood-trends', icon: 'show_chart' },
  ]);

  activeTab = signal<string>('Mood Heatmap');

  constructor() {
    effect(() => {
      const data = this.analyticsResource.value();
      if (data) {
        this.processMoodData(data);
      }
    });
  }

  ngOnInit(): void {
    const initialMoods: Mood[] = STANDARD_MOODS.map((label) => ({
      label,
      percent: 0,
      entries: 0,
      delta: 0,
      color: MOOD_COLORS[label],
    }));

    this.moods.set(initialMoods);
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

  getMoodIcon(mood: string): string {
    switch (mood) {
      case 'Happy':
        return 'sentiment_very_satisfied';
      case 'Neutral':
        return 'sentiment_neutral';
      case 'Sad':
        return 'sentiment_dissatisfied';
      case 'Anxious':
        return 'flutter_dash';
      case 'Energetic':
        return 'bolt';
      default:
        return 'mood';
    }
  }

  setActiveTab(tabName: string): void {
    this.activeTab.set(tabName);
  }

  navigateToTab(tabPath: string): void {
    this.router.navigate(['/dashboard/moods', tabPath]);
  }

  export(): void {
    console.log('Exporting Mood Analytics data...');
  }
}
