import { Component, inject, input } from '@angular/core';

import { Blog } from '../../../../../core/models/blog';

import {
  ModalOpenButtonComponent
} from '../../../../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../../../../core/services/blog.service';

@Component({
  selector: 'blog-card-options-button',
  templateUrl: './options-button.component.html',
  imports: [
    ModalOpenButtonComponent
  ]
})
export class OptionsButtonComponent {
  blogService = inject(BlogService);

  blog = input.required<Blog>();
}
