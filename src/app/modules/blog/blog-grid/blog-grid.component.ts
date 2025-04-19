import { Component, input } from '@angular/core';
import { Blog, Status } from '../../../core/models/blog';
import { BlogCardComponent } from './blog-card/blog-card.component';

@Component({
  selector: 'blog-grid',
  imports: [
    BlogCardComponent
  ],
  templateUrl: './blog-grid.component.html',
})
export class BlogGridComponent {

  blogs = input.required<Blog[]>();

  protected readonly Status = Status;
}
