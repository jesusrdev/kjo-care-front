import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'navbar-notifications',
  templateUrl: './notifications.component.html',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationsComponent {
  notifications = signal([
    {
      id: 1,
      title: 'New message',
      description: 'You have a new message',
      date: '2025-04-15T16:30:00-08:00',
      type: 'info',
    },
    {
      id: 2,
      title: 'New message',
      description: 'You have a new message',
      date: '2025-01-01T16:30:00-08:00',
      type: 'info',
    },
    {
      id: 3,
      title: 'New message',
      description: 'You have a new message',
      date: '2025-01-01T16:30:00-08:00',
      type: 'info',
    },
  ]);
}
