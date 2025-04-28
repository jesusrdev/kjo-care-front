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
      { path: "settings", loadChildren: () => import("./modules/settings/settings.routes") }
    ],
    //canActivate: [authGuard]
  },

];
