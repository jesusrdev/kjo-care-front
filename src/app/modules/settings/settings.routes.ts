import { Routes } from "@angular/router";
import SettingsComponent from "./settings.component";

export default [

  {
    path: "", component: SettingsComponent,
    children: [
      { path: "", redirectTo: "general", pathMatch: "full" },
      { path: "general", loadComponent: () => import("./setting-general/setting-general.component") },
      { path: "mood-states", loadComponent: () => import("./setting-mood-state/setting-mood-state.component") },
      { path: "category", loadComponent: () => import("./setting-category/setting-category.component") },
    ]
  },
] as Routes;

