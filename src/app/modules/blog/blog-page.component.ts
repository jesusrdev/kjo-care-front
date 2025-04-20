import { Component, inject, signal } from '@angular/core';
import { Blog, Category, FilterDTO, Status } from '../../core/models/blog';
import { BlogModalComponent } from './blog-modal/blog-modal.component';
import { BlogGridComponent } from './blog-grid/blog-grid.component';
import { BlogTableComponent } from './blog-table/blog-table.component';
import { BlogFilterComponent } from './blog-filter/blog-filter.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { ModalOpenButtonComponent } from '../../shared/components/modal-open-button/modal-open-button.component';
import { BlogService } from '../../core/services/blog.service';

@Component({
  selector: 'app-blog',
  imports: [
    BlogModalComponent,
    BlogGridComponent,
    BlogTableComponent,
    BlogFilterComponent,
    BlogDetailComponent,
    ModalOpenButtonComponent
  ],
  templateUrl: './blog-page.component.html'
})
export class BlogPageComponent {

  blogService = inject(BlogService);

  blogs = signal<Blog[]>([
    {
      id: 1,
      userId: 1,
      categoryId: 1,
      title: 'Blog 1 lalalalalalalalal alalalalalaalalaasdas dasdasdasdasdasdasda dasdasdadas',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
      image: 'https://picsum.photos/id/10/200/300',
      video: 'https://videos.pexels.com/video-files/8057698/8057698-uhd_3840_2160_25fps.mp4',
      publishedDate: '2023-01-01',
      modificationDate: '2023-01-01',
      status: Status.Published,
      user: {
        firstName: 'John Doe',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com'
      },
      category: {
        id: 1,
        name: 'Mental Health'
      }
    },
    {
      id: 2,
      userId: 1,
      categoryId: 2,
      title: 'Blog 2',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
      image: 'https://picsum.photos/id/10/200/300',
      publishedDate: '2023-01-01',
      modificationDate: '2023-01-01',
      status: Status.Published,
      user: {
        firstName: 'John Doe',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com'
      },
      category: {
        id: 2,
        name: 'Nutrition'
      }
    },
    {
      id: 3,
      userId: 1,
      categoryId: 1,
      title: 'Blog 3',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
      image: 'https://picsum.photos/id/10/200/300',
      publishedDate: '2023-01-01',
      modificationDate: '2023-01-01',
      status: Status.Draft,
      user: {
        firstName: 'John Doe',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com'
      },
      category: {
        id: 1,
        name: 'Mental Health'
      }
    },
    {
      id: 4,
      userId: 2,
      categoryId: 3,
      title: 'Blog 4',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
      image: 'https://picsum.photos/id/10/200/300',
      publishedDate: '2023-01-01',
      modificationDate: '2023-01-01',
      status: Status.Draft,
      user: {
        firstName: 'John Doe',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com'
      },
      category: {
        id: 3,
        name: 'Fitness'
      }
    },
    {
      id: 5,
      userId: 1,
      categoryId: 3,
      title: 'Blog 5',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.',
      image: 'https://picsum.photos/id/10/200/300',
      publishedDate: '2023-01-01',
      modificationDate: '2023-01-01',
      status: Status.Published,
      user: {
        firstName: 'John Doe',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com'
      },
      category: {
        id: 3,
        name: 'Fitness'
      }
    }
  ]);
  filteredBlogs = signal<Blog[]>([]);

  categories = signal<Category[]>([
    {
      id: 1,
      name: 'Mental Health'
    },
    {
      id: 2,
      name: 'Nutrition'
    },
    {
      id: 3,
      name: 'Fitness'
    }
  ]);

  ngOnInit(): void {
    this.filteredBlogs.set(this.blogs());
  }

  filterBlogs(filter: FilterDTO) {
    let temporal = this.blogs();

    if (filter.search.length > 0) {
      temporal = temporal.filter(blog => blog.title.toLowerCase().includes(filter.search.toLowerCase()));
    }

    if (filter.category > 0) {
      temporal = temporal.filter(blog => blog.categoryId === filter.category);
    }

    if (filter.status.length > 0) {
      temporal = temporal.filter(blog => blog.status === filter.status);
    }

    this.filteredBlogs.set(temporal);
  }
}
