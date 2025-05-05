import { Component, computed, effect, inject, signal } from '@angular/core';
import { Category, FilterDTO, Status } from '../../core/models/blog';
import { BlogModalComponent } from './blog-modal/blog-modal.component';
import { BlogGridComponent } from './blog-grid/blog-grid.component';
import { BlogTableComponent } from './blog-table/blog-table.component';
import { BlogFilterComponent } from './blog-filter/blog-filter.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { ModalOpenButtonComponent } from '../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../core/services/blog.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { blogs } from '../../shared/utils/local-data';
import { BlogResponse } from '../../core/interfaces/blog-http.interface';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-blog',
  imports: [
    BlogModalComponent,
    BlogGridComponent,
    BlogTableComponent,
    BlogFilterComponent,
    BlogDetailComponent,
    DialogComponent,
    ModalOpenButtonComponent
  ],
  templateUrl: './blog-page.component.html'
})
export default class BlogPageComponent {

  blogService = inject(BlogService);
  categoryService = inject(CategoryService);
  toastService = inject(ToastService);

  blogs = rxResource({
    loader: () => this.blogService.findAll()
  });
  _categories = rxResource({
    loader: () => this.categoryService.findAll()
  });

  categories = computed<Category[]>(() => {
    return this._categories.value() ?? [];
  });

  filteredBlogs = computed<BlogResponse[]>(() => {
    let temporal = this.blogs.value() ?? [];
    const filter = this.filter();

    if (filter.search.length > 0) {
      temporal = temporal.filter(blog => blog.blog.title.toLowerCase().includes(filter.search.toLowerCase()));
    }

    if (filter.category > 0) {
      temporal = temporal.filter(blog => blog.blog.category?.id === filter.category);
    }

    if (filter.status.length > 0) {
      temporal = temporal.filter(blog => blog.blog.state === filter.status);
    }

    return temporal;
  });

  private filter = signal<FilterDTO>({
    search: '',
    category: 0,
    status: Status.Published
  });

  setFilter(filter: FilterDTO) {
    this.filter.set(filter);
  }

  deleteBlog() {
    this.blogService.delete(this.blogService.selectedBlog?.blog.id ?? '').subscribe({
      next: () => {
        this.toastService.addToast({
          message: 'Blog deleted successfully',
          type: 'success',
          duration: 4000
        });

        this.reload();
      },
      error: (error) => {
        this.toastService.addToast({
          message: 'Error deleting blog',
          type: 'error',
          duration: 4000
        });
      }
    });
  }

  reload() {
    this.blogs.reload();
  }

  constructor() {
    effect(() => {
      switch (this.blogs.status()) {
        case 1:
          this.toastService.addToast({
            message: 'No se pudieron cargar los blogs',
            type: 'error',
            duration: 3000
          });

          this.blogs.set(blogs);
          break;
        case 5:
          this.toastService.addToast({
            message: 'Se usaran blogs de ejemplo',
            type: 'info',
            duration: 3000
          });
          break;
      }
    });
  }
}
