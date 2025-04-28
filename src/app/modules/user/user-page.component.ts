import { Component, computed, inject, signal } from '@angular/core';
import { ModalOpenButtonComponent } from '../../shared/components/modal-open-button/modal-open-button.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/services/user.service';
import { UserTableComponent } from './user-table/user-table.component';
import { UserModalComponent } from './user-modal/user-modal.component';
import { UserRequest, UserResponse } from '../../core/interfaces/user-http.interface';

@Component({
  selector: 'app-user',
  templateUrl: './user-page.component.html',
  imports: [
    ModalOpenButtonComponent,
    UserTableComponent,
    UserModalComponent
  ]
})
export default class UserPageComponent {

  userService = inject(UserService);

  search = signal<string>('');

  users = rxResource({
    loader: () => this.userService.getAll()
  });

  readonly filteredUsers = computed(() => {
    let temporal: UserResponse[] = this.users.value() ?? [];

    if (this.search().length > 0) {
      temporal = temporal.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`;
        return fullName.toLowerCase().includes(this.search().toLowerCase());
      });
    }

    return temporal;
  });

  reload() {
    this.users.reload();
  }
}
