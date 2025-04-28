import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Blog } from '../models/blog';
import { blogs } from '../../shared/utils/local-data';
import { BlogResponse } from '../interfaces/blog-http.interface';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseUrl: string = environment.apiUrl + '/blog/blogs';

  private http = inject(HttpClient);

  private _selectedBlog = signal<BlogResponse>(blogs[0]);

  get selectedBlog(): BlogResponse {
    return this._selectedBlog();
  }

  set selectedBlog(blog: BlogResponse) {
    this._selectedBlog.set(blog);
  }

  findAll(): Observable<BlogResponse[]> {
    return this.http.get<BlogResponse[]>(`${this.baseUrl}/all`);
  }

  // findAll(): Observable<Blog[]> {
  //   return this.http.get<{
  //     content: Blog[];
  //     page: number;
  //     size: number;
  //   }>(`${this.baseUrl}/all`).pipe(
  //     map(({ content }) => content)
  //   );
  // }

  getById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/${id}`);
  }

  create(request: FormData): Observable<Blog> {
    return this.http.post<Blog>(`${this.baseUrl}`, request);
  }

  update(request: FormData, id: number): Observable<Blog> {
    return this.http.put<Blog>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
