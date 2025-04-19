import { Component, input } from '@angular/core';
import { Blog } from '../../../../../core/models/blog';
import {
  ModalOpenButtonComponent
} from '../../../../../shared/components/modal-open-button/modal-open-button.component';

@Component({
  selector: 'blog-card-options-button',
  templateUrl: './options-button.component.html',
  imports: [
    ModalOpenButtonComponent
  ]
})
export class OptionsButtonComponent {

  blog = input.required<Blog>();

}
