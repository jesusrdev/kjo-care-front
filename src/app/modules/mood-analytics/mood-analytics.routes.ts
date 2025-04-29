import { Routes } from "@angular/router";
import { MoodAnalyticsComponent } from "./mood-analytics.component";
import { MoodHeatmapComponent } from "./mood-heatmap/mood-heatmap.component";

export default [

  {
    path: "", component: MoodAnalyticsComponent,
    children: [
      { path: "", redirectTo: "mood-heatmap", pathMatch: "full" },
      { path: "mood-heatmap", component: MoodHeatmapComponent }

    ]
  },
] as Routes;

