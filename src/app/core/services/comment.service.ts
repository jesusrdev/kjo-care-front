import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { Observable } from 'rxjs';

import { Category } from '../models/blog';
import { CommentRequest, CommentResponse } from '../interfaces/comment-http.interface';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl: string = environment.apiUrl + '/api/mind/blog/comment';

  private http = inject(HttpClient);

  readonly _selectedComment = signal<CommentRequest>({
    id: 0,
    content: '',
    blogId: 0,
    commentParentId: null
  });

  get selectedComment(): CommentRequest {
    return this._selectedComment();
  }

  set selectedComment(comment: CommentRequest) {
    this._selectedComment.set(comment);
  }

  create(request: CommentRequest): Observable<CommentResponse> {
    if (!request.commentParentId) {
      return this.http.post<CommentResponse>(`${this.baseUrl}?blogId=${request.blogId}&content=${request.content}`, null);
    }
    return this.http.post<CommentResponse>(`${this.baseUrl}?blogId=${request.blogId}&commentParentId=${request.commentParentId}&content=${request.content}`, request);
  }

  update(request: CommentRequest, id: number): Observable<CommentResponse> {
    if (!request.commentParentId) {
      return this.http.put<CommentResponse>(`${this.baseUrl}/${id}?blogId=${request.blogId}&content=${request.content}`, null);
    }
    return this.http.put<CommentResponse>(`${this.baseUrl}/${id}?blogId=${request.blogId}&commentParentId=${request.commentParentId}&content=${request.content}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
