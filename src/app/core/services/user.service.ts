import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserProfile } from '../models/user-profile';
import { Observable } from 'rxjs';
import { UserRequest, UserResponse } from '../interfaces/user-http.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/auth/users`;
  private http = inject(HttpClient);

  private _selectedUser = signal<UserRequest | null>(null);

  get selectedUser(): UserRequest | null {
    return this._selectedUser();
  }

  set selectedUser(user: UserRequest | null) {
    this._selectedUser.set(user);
  }

  getAll() : Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.baseUrl}/list`);
  }

  create(request: UserRequest) {
    return this.http.post(`${this.baseUrl}/register`, request);
  }

  update(request: UserRequest) {
    return this.http.put(`${this.baseUrl}/update/${request.id}`, request);
  }
}
