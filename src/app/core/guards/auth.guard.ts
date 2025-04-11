import { Router, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { KeycloakService } from '../../modules/auth/services/keycloak.service';

export const authGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  if (keycloakService.keycloak.isTokenExpired()) {
    router.navigate(['login']);
    // Evita que la pagina entre en un ciclo infinito de recarga
    return false;
  }
  return true;
};
