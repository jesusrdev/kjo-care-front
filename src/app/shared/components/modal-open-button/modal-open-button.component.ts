import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'modal-open-button',
  templateUrl: './modal-open-button.component.html',
  imports: [
    NgClass
  ]
})
export class ModalOpenButtonComponent {
  modalName = input.required<string>();
  type = input<'text' | 'icon' | 'dropdown'>('text');
  classes = input<string>();
  label = input<string>();

  openModal() {
    const dialog = document.getElementById(this.modalName()) as HTMLDialogElement;
    dialog.showModal(); // Show the modal dialog
  }

}
