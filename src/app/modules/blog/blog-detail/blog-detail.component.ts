import { Component, inject, input } from '@angular/core';
import { ModalOpenButtonComponent } from '../../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../../core/services/blog.service';
import { BlogResponse } from '../../../core/interfaces/blog-http.interface';

@Component({
  selector: 'blog-detail',
  templateUrl: './blog-detail.component.html',
  imports: [
    ModalOpenButtonComponent
  ]
})
export class BlogDetailComponent {
  blogService = inject(BlogService);

  blog = input.required<BlogResponse>();

  type = input<'text' | 'icon'>('text');


}
