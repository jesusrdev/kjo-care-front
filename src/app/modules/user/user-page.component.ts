import { Component, computed, inject, signal } from '@angular/core';
import { ModalOpenButtonComponent } from '../../shared/components/modal-open-button/modal-open-button.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/services/user.service';
import { UserTableComponent } from './user-table/user-table.component';
import { UserModalComponent } from './user-modal/user-modal.component';
import { UserRequest, UserResponse } from '../../core/interfaces/user-http.interface';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-user',
  templateUrl: './user-page.component.html',
  imports: [
    DialogComponent,
    ModalOpenButtonComponent,
    UserTableComponent,
    UserModalComponent
  ]
})
export default class UserPageComponent {

  readonly userService = inject(UserService);
  readonly toastService = inject(ToastService);

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

  deleteUser() {
    this.userService.delete(this.userService.selectedUser?.id ?? '').subscribe({
      next: () => {
        this.toastService.addToast({
          message: 'User deleted successfully',
          type: 'success',
          duration: 4000
        });

        this.reload();
      },
      error: (error) => {
        this.toastService.addToast({
          message: 'Error deleting user',
          type: 'error',
          duration: 4000
        });
      }
    });
  }

  reload() {
    this.users.reload();
  }
}
