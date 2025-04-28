import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    RouterModule,
    NavbarComponent,
    SidebarComponent
  ]
})
export default class DashboardComponent {

}
