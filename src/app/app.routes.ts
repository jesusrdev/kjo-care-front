import { Routes } from '@angular/router';
import { HomeComponent } from './modules/main/home/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    //canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./shared/components/layout/dashboard/dashboard.component'),
    children: [
      { path: '', loadComponent: () => import('./modules/dashboard/dashboard-page.component'), },
      { path: 'blog-management', loadComponent: () => import('./modules/blog/blog-page.component') },
      { path: 'moods', loadChildren: () => import('./modules/mood-analytics/mood-analytics.routes') },
      { path: "settings", loadChildren: () => import("./modules/settings/settings.routes") },
      { path: "health-centers", loadComponent: () => import("./modules/health-center/health-center.component") }
    ],
    //canActivate: [authGuard]
  },

];
