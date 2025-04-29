import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KeycloakService } from '../../auth/services/keycloak.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

 private keycloakService = inject(KeycloakService);

  async logout() {
    await this.keycloakService.logout();
  }

  async account() {
    await this.keycloakService.goToAccountManagement();
  }

}
