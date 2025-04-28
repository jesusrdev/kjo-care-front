import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { httpTokenInterceptor } from './core/interceptors/http-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withViewTransitions({
        skipInitialTransition: false,
        onViewTransitionCreated: (transitionInfo) => {
          console.log('Transición creada : ', transitionInfo);
        }
      })
    ),
    provideHttpClient(
      withInterceptors([httpTokenInterceptor]), withFetch()
    )
  ]
};
