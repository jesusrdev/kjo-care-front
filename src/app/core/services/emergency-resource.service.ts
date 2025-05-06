import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EmergencyResourceResponse, EmergencyResourceStats } from '../interfaces/emergency-resource-http.interface';

@Injectable({
  providedIn: 'root'
})
export class EmergencyResourceService {
  private baseUrl: string = environment.apiUrl + '/api/mind/emergency/resources';

  private http = inject(HttpClient);

  selectedResource = signal<EmergencyResourceResponse>({
    id: 0,
    user: {
      id: '',
      username: '',
      firstName: '',
      lastName: ''
    },
    name: '',
    description: '',
    resourceUrl: '',
    contacts: [],
    links: [],
    status: '',
    accessCount: 0,
    createdDate: '',
    modifiedDate: ''
  });

  getAll(): Observable<EmergencyResourceResponse[]> {
    return this.http.get<EmergencyResourceResponse[]>(`${this.baseUrl}`);
  }

  getStats(): Observable<EmergencyResourceStats> {
    return this.http.get<EmergencyResourceStats>(`${this.baseUrl}/stats`);
  }
}
