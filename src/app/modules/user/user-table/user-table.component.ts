import { Component, inject, input } from '@angular/core';
import { ModalOpenButtonComponent } from '../../../shared/components/modal-open-button/modal-open-button.component';
import { UserService } from '../../../core/services/user.service';
import { DatePipe } from '@angular/common';
import { UserRequest, UserResponse } from '../../../core/interfaces/user-http.interface';

@Component({
  selector: 'user-table',
  imports: [
    ModalOpenButtonComponent,
    DatePipe
  ],
  templateUrl: './user-table.component.html'
})
export class UserTableComponent {
  userService = inject(UserService);

  users = input.required<UserResponse[]>();

}
