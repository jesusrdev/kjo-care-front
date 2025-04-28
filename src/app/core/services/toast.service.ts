import { computed, Injectable, signal } from '@angular/core';
import { Toast } from '../interfaces/toast';


@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  addToast(toast: Toast) {
    this.toasts.update(list => [...list, toast]);

    setTimeout(() => {
      this.toasts.update(list => {
        list.shift();
        return list;
      });
    }, toast.duration);
  }
}
