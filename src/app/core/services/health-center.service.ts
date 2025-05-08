import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HealthCenterRequest, HealthCenterResponse } from '../interfaces/health-center-http.interface';

@Injectable({
  providedIn: 'root'
})
export class HealthCenterService {
  private baseUrl: string = environment.apiUrl + '/api/mind/emergency/centers';

  private http = inject(HttpClient);

  selectedCenter = signal<HealthCenterResponse>({
    name: '',
    address: '',
    phone: '',
    latitude: 0,
    longitude: 0,
    id: 0,
    user: {
      firstName: '',
      lastName: '',
      username: '',
    },
    status: '',
    createdDate: '',
    modifiedDate: ''
  });

  getAll(): Observable<HealthCenterResponse[]> {
    return this.http.get<HealthCenterResponse[]>(`${this.baseUrl}/all`);
  }
  //
  // getStats(): Observable<EmergencyResourceStats> {
  //   return this.http.get<EmergencyResourceStats>(`${this.baseUrl}/stats`);
  // }
  //
  // getById(id: number): Observable<EmergencyResourceResponse> {
  //   return this.http.get<EmergencyResourceResponse>(`${this.baseUrl}/${id}`);
  // }

  create(request: HealthCenterRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}?name=${request.name}&address=${request.address}&phone=${request.phone}&latitude=${request.latitude}&longitude=${request.longitude}`, request);
  }

  // update(request: FormData, id: number): Observable<void> {
  //   return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  // }
  //
  // delete(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.baseUrl}/${id}`);
  // }

  async getLocalData() {
    const response = await fetch('/centers.csv');
    return response.blob().then(blob => new File([blob], 'centers.csv'));
  }
}
