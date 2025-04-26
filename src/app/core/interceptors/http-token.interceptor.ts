import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { KeycloakService } from '../../modules/auth/services/keycloak.service';

export function httpTokenInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const keycloakService = inject(KeycloakService);
  const token = keycloakService.keycloak.token;
  // console.log("Token:", token)
  if (token) {
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }


  return next(request);
}
