import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { httpTokenInterceptor } from './core/interceptors/http-token.interceptor';
import { KeycloakService } from './modules/auth/services/keycloak.service';
export function kcFactory() {
  const kcService = inject(KeycloakService)
  return kcService.init();
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withViewTransitions({
        skipInitialTransition: false,
        onViewTransitionCreated: (transitionInfo) => {
          console.log("Transicion creada : ", transitionInfo)
        }
      })

    ),
    provideHttpClient(
      withInterceptors([httpTokenInterceptor]), withFetch()
    ),
    provideAppInitializer(kcFactory)
  ]
};
