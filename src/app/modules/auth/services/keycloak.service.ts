import { Injectable, signal, computed } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../../environments/environment';
import { UserProfile } from '../../../core/models/user-profile';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  // Señales privadas para el estado interno
  private _keycloakInstance = signal<Keycloak | undefined>(undefined);
  private _userProfile = signal<UserProfile | undefined>(undefined);
  private _isAuthenticated = signal<boolean>(false);

  readonly profile = computed(() => this._userProfile());
  readonly isAuthenticated = computed(() => this._isAuthenticated());

  private initKeycloak(): Keycloak {
    if (!this._keycloakInstance()) {
      const keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });
      this._keycloakInstance.set(keycloak);
    }
    return this._keycloakInstance()!;
  }

  get keycloak(): Keycloak {
    return this.initKeycloak();
  }

  async init() {
    console.log("Autenticando al usuario...");
    const keycloak = this.initKeycloak();

    try {
      const authenticated = await keycloak.init({
        onLoad: 'login-required',
      });

      this._isAuthenticated.set(authenticated);

      if (authenticated) {
        console.log("Usuario autenticado");
        // Recuperar la información del usuario
        const userProfile = await keycloak.loadUserProfile() as UserProfile;
        userProfile.token = keycloak.token || '';

        // Actualizar la señal con el perfil completo
        this._userProfile.set(userProfile);
      }
    } catch (error) {
      console.error('Error al inicializar Keycloak:', error);
      this._isAuthenticated.set(false);
    }
  }

  login() {
    return this.keycloak.login();
  }

  logout() {
    this._isAuthenticated.set(false);
    this._userProfile.set(undefined);
    return this.keycloak.logout();
  }

  goToAccountManagement() {
    return this.keycloak.accountManagement()
  }
}
