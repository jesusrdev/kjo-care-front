import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'trends-analysis',
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-trends-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodTrendsAnalysisComponent {
  private analyticsService = inject(AnalyticsService);

  month = signal<number>(6);

  loadTrendsAnalysis = rxResource({
    request: () => ({ month: this.month() }),
    loader: ({ request }) => this.analyticsService.getMoodTrendsAnalysis(request.month)
  });

  timeOptions = [
    { value: 1, label: '1 mes' },
    { value: 3, label: '3 meses' },
    { value: 6, label: '6 meses' },
    { value: 12, label: '12 meses' }
  ];

  updateTimePeriod(months: number): void {
    this.month.set(months);
    this.loadTrendsAnalysis.reload();
  }

  getTrendColor(direction: string): string {
    switch (direction) {
      case 'Improving':
        return 'text-success';
      case 'Declining':
        return 'text-error';
      default:
        return 'text-info';
    }
  }

  getTrendIcon(direction: string): string {
    switch (direction) {
      case 'Improving':
        return 'trending_up';
      case 'Declining':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  }

  getVariabilityColor(level: string): string {
    switch (level) {
      case 'Low':
        return 'text-success';
      case 'Moderate':
        return 'text-warning';
      case 'High':
        return 'text-error';
      default:
        return 'text-info';
    }
  }

  getMoodIcon(mood: string): string {
    switch (mood?.toLowerCase()) {
      case 'happy':
        return 'sentiment_very_satisfied';
      case 'sad':
        return 'sentiment_very_dissatisfied';
      case 'anxious':
        return 'flutter_dash';
      case 'energetic':
        return 'bolt';
      case 'neutral':
        return 'sentiment_neutral';
      default:
        return 'mood';
    }
  }

  getMoodColor(mood: string): string {
    switch (mood?.toLowerCase()) {
      case 'happy':
        return 'text-success';
      case 'sad':
        return 'text-purple-500';
      case 'anxious':
        return 'text-amber-500';
      case 'energetic':
        return 'text-orange-500';
      case 'neutral':
        return 'text-blue-500';
      default:
        return 'text-primary';
    }
  }
}
