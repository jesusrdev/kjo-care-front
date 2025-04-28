import { Component, inject } from '@angular/core';
import { KeycloakService } from '../../../../modules/auth/services/keycloak.service';

@Component({
  selector: 'navbar-profile-button',
  templateUrl: './profile-button.component.html',
  imports: []
})
export class ProfileButtonComponent {
  private keycloakService = inject(KeycloakService)

  async logout() {
    await this.keycloakService.logout()
  }

  async account() {
    await this.keycloakService.goToAccountManagement()
  }
}
