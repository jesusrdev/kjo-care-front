import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../core/services/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  imports: [
    NgClass
  ]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
