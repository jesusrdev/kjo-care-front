import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Blog, Category, Status } from '../../../core/models/blog';

import { FormUtils } from '../../../shared/utils/form-utils';
import { BlogService } from '../../../core/services/blog.service';
import { ToastService } from '../../../core/services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user.service';
import { UserRequest, UserResponse } from '../../../core/interfaces/user-http.interface';

@Component({
  selector: 'user-modal',
  templateUrl: './user-modal.component.html',
  imports: [
    ReactiveFormsModule,
    NgClass
  ]
})
export class UserModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  reload = output();

  formUtils = FormUtils;

  user = input<UserResponse | null>(null);
  type = input<'create' | 'edit'>('create');

  title = signal('Add new user');
  nameButton = signal('Save');
  nameModal = computed(() => this.type() === 'create' ? 'modal_user_create' : 'modal_user_edit');
  showPassword = signal(false);

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.minLength(3)]],
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]],
    roles: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.type() == 'edit') {
      this.title.set('Edit blog');
      this.nameButton.set('Update');
    }
  }

  constructor() {
    effect(() => {
      console.log('User seleccionado', this.userService.selectedUser);
      console.log('User seleccionado', this.user());
      if (this.user()) {
        const role = this.user()?.roles.includes('admin') ? 'admin' : this.user()?.roles.includes('user') ? 'user' : '';

        this.userForm.patchValue({
          email: this.user()?.email,
          firstName: this.user()?.firstName,
          lastName: this.user()?.lastName,
          password: 'without password',
          roles: role
        });
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    const request: UserRequest = {
      id: this.user()?.id,
      username: this.userForm.value.email!,
      email: this.userForm.value.email!,
      firstName: this.userForm.value.firstName!,
      lastName: this.userForm.value.lastName!,
      password: this.userForm.value.password!,
      roles: [this.userForm.value.roles ?? '']
    };

    if (this.user()) {
      return this.userService.update(request).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'User updated successfully',
              type: 'success',
              duration: 3000
            });

            this.reload.emit();
          },
          error: (error) => {
            this.toastService.addToast({
              message: 'Error updating user',
              type: 'error',
              duration: 3000
            });
          }
        });
    } else {
      return this.userService.create(request).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'User created successfully',
              type: 'success',
              duration: 3000
            });

            this.reload.emit();
          },
          error: (error) => {
            this.toastService.addToast({
              message: 'Error creating user',
              type: 'error',
              duration: 3000
            });
          }
        });
    }

    // this.blogForm.reset(
    //   {
    //     title: '',
    //     content: '',
    //     image: null,
    //     video: null,
    //     category: '',
    //     status: ''
    //   }
    // );
  }

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }
}
