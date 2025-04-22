import { Component, input } from '@angular/core';
import { Blog, Status } from '../../../core/models/blog';
import { BlogCardComponent } from './blog-card/blog-card.component';

@Component({
  selector: 'blog-grid',
  templateUrl: './blog-grid.component.html',
  imports: [
    BlogCardComponent
  ]
})
export class BlogGridComponent {

  blogs = input.required<Blog[]>();

  protected readonly Status = Status;
}
