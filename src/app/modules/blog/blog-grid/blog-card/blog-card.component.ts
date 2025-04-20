import { Component, inject, input } from '@angular/core';
import { Blog, Status } from '../../../../core/models/blog';
import { OptionsButtonComponent } from './options-button/options-button.component';
import { ModalOpenButtonComponent } from '../../../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../../../core/services/blog.service';

@Component({
  selector: 'blog-card',
  templateUrl: './blog-card.component.html',
  imports: [
    OptionsButtonComponent,
    ModalOpenButtonComponent
  ]
})
export class BlogCardComponent {
  blogService = inject(BlogService);

  blog = input.required<Blog>();

  protected readonly Status = Status;
}
