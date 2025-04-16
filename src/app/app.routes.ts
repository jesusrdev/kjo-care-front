import { Routes } from '@angular/router';
import { HomeComponent } from './modules/main/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './shared/components/layout/dashboard/dashboard.component';

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
      import('./shared/components/layout/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    children: [],
    //canActivate: [authGuard]
  },
];
