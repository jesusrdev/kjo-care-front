import { Component } from '@angular/core';
import { NotificationsComponent } from "../notifications/notifications.component";
import { ProfileButtonComponent } from "../profile-button/profile-button.component";

@Component({
  selector: 'layout-navbar',
  templateUrl: './navbar.component.html',
  imports: [NotificationsComponent, ProfileButtonComponent],
})
export class NavbarComponent {

}
