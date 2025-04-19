import { Component, input } from '@angular/core';
import { Blog } from '../../../core/models/blog';

@Component({
  selector: 'blog-detail',
  templateUrl: './blog-detail.component.html',
  imports: []
})
export class BlogDetailComponent {

  blog = input.required<Blog>();

  type = input<'text' | 'icon'>('text');


}
