import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { Observable } from 'rxjs';

import { Category } from '../models/blog';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl: string = environment.apiUrl + '/blog/category';

  private http = inject(HttpClient);

  findAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}`);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(request: Category): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}`, request);
  }

  update(request: Category, id: number): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
