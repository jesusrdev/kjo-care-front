import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KeycloakService } from '../../auth/services/keycloak.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {

  private keycloackService = inject(KeycloakService)

  async logout() {
    await this.keycloackService.logout()
  }

  async accout() {
    await this.keycloackService.goToAccountManagement()
  }

}
