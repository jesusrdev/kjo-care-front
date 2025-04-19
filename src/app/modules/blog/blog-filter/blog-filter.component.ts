import { Component, input } from '@angular/core';
import { Category, Status } from '../../../core/models/blog';

@Component({
  selector: 'blog-filter',
  imports: [],
  templateUrl: './blog-filter.component.html'
})
export class BlogFilterComponent {

  categories = input.required<Category[]>();

  protected readonly Status = Status;
}
