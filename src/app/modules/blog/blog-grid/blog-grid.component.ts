import { Component, input } from '@angular/core';
import { Status } from '../../../core/models/blog';
import { BlogCardComponent } from './blog-card/blog-card.component';
import { BlogResponse } from '../../../core/interfaces/blog-http.interface';

@Component({
  selector: 'blog-grid',
  templateUrl: './blog-grid.component.html',
  imports: [
    BlogCardComponent
  ]
})
export class BlogGridComponent {

  blogs = input.required<BlogResponse[]>();

  protected readonly Status = Status;
}
