import { Component, inject, input, output } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  imports: [],
})
export class DialogComponent {

  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly modalName = input.required<string>();
  readonly buttonText = input<string>('Accept');

  readonly callback = output();

  doCallback() {
    this.callback.emit();
  }
}
