import { Component, inject, input } from '@angular/core';
import { Blog } from '../../../core/models/blog';
import { ModalOpenButtonComponent } from '../../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'blog-detail',
  templateUrl: './blog-detail.component.html',
  imports: [
    ModalOpenButtonComponent
  ]
})
export class BlogDetailComponent {
  blogService = inject(BlogService);

  blog = input.required<Blog>();

  type = input<'text' | 'icon'>('text');


}
