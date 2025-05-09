import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from './modules/auth/services/keycloak.service';
import { ToastComponent } from './shared/components/layout/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
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
