import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Blog } from '../models/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseUrl: string = environment.apiUrl;

  private _selectedBlog = signal<Blog | undefined>(undefined);

  get selectedBlog(): Blog | undefined {
    return this._selectedBlog();
  }

  set selectedBlog(blog: Blog | undefined) {
    console.log('Blog seleccionado: ', blog);
    this._selectedBlog.set(blog);
  }

  getBlogs() {
  }

  createBlog() {
  }

  updateBlog() {
  }

  deleteBlog() {
  }
}
