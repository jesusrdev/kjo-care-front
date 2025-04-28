import { Component, inject, input } from '@angular/core';
import { Status } from '../../../core/models/blog';
import { ModalOpenButtonComponent } from '../../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../../core/services/blog.service';
import { BlogResponse } from '../../../core/interfaces/blog-http.interface';

@Component({
  selector: 'blog-table',
  imports: [
    ModalOpenButtonComponent
  ],
  templateUrl: './blog-table.component.html'
})
export class BlogTableComponent {
  blogService = inject(BlogService);

  protected readonly Status = Status;

  blogs = input.required<BlogResponse[]>();

}
