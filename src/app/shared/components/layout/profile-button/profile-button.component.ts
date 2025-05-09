import { Component, computed, inject } from '@angular/core';
import { KeycloakService } from '../../../../modules/auth/services/keycloak.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'navbar-profile-button',
  templateUrl: './profile-button.component.html',
  imports: [
    RouterLink
  ]
})
export class ProfileButtonComponent {
  private keycloakService = inject(KeycloakService);

  readonly userLetters = computed<string>(() => {
    const firstName: string = this.keycloakService.profile()?.firstName ?? '?';
    const lastName: string = this.keycloakService.profile()?.lastName ?? '?';
    return firstName[0] + lastName[0];
  });

  async logout() {
    await this.keycloakService.logout();
  }

  async account() {
    await this.keycloakService.goToAccountManagement();
  }
}
