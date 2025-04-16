import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'layout-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
})
export class SidebarComponent {
  links = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      // icon: IconComponent,
    },
    {
      name: 'User Management',
      path: '/dashboard/users',
    },
    {
      name: 'Health Centers',
      path: '/dashboard/health-centers',
    },
    {
      name: 'Recursos de Emergencia',
      path: '/dashboard/emergency-resources',
    },
    {
      name: 'Blog Management',
      path: '/dashboard/blog-management',
    },
    {
      name: 'Mood Analytics',
      path: '/dashboard/moods',
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
    },
    {
      name: 'Audit logs',
      path: '/dashboard/audit-logs',
    },
  ];
}
