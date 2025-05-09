import { Routes } from '@angular/router';
import { MoodAnalyticsComponent } from './mood-analytics.component';
import { MoodHeatmapComponent } from './mood-heatmap/mood-heatmap.component';
import { MoodDistributionComponent } from './mood-distribution/mood-distribution.component';
import { MoodTrendsComponent } from './mood-trends/mood-trends.component';

export default [
  {
    path: '',
    component: MoodAnalyticsComponent,
    children: [
      { path: '', redirectTo: 'mood-heatmap', pathMatch: 'full' },
      { path: 'mood-heatmap', component: MoodHeatmapComponent },
      { path: 'mood-distribution', component: MoodDistributionComponent },
      { path: 'mood-trends', component: MoodTrendsComponent },
    ],
  },
] as Routes;
