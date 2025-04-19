import { Component, input } from '@angular/core';
import { Blog, Status } from '../../../core/models/blog';
import { ModalOpenButtonComponent } from '../../../shared/components/modal-open-button/modal-open-button.component';

@Component({
  selector: 'blog-table',
  imports: [
    ModalOpenButtonComponent
  ],
  templateUrl: './blog-table.component.html'
})
export class BlogTableComponent {

  blogs = input.required<Blog[]>();

  protected readonly Status = Status;
}
