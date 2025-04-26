import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from './modules/auth/services/keycloak.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  keycloakService = inject(KeycloakService);

  login() {
    this.keycloakService.login();
  }

  ngOnInit() {
    this.keycloakService.init();
  }
}
