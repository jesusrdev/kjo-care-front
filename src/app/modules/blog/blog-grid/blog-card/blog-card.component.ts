import { Component, input } from '@angular/core';
import { Blog, Status } from '../../../../core/models/blog';
import { OptionsButtonComponent } from './options-button/options-button.component';
import { ModalOpenButtonComponent } from '../../../../shared/components/modal-open-button/modal-open-button.component';

@Component({
  selector: 'blog-card',
  templateUrl: './blog-card.component.html',
  imports: [
    OptionsButtonComponent,
    ModalOpenButtonComponent
  ]
})
export class BlogCardComponent {
  blog = input.required<Blog>();

  protected readonly Status = Status;
}
