import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DailyBlogsStats, DashboardStats, UserMoodStats } from '../interfaces/dashboard-http.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl: string = environment.apiUrl + '/api/mind/analytics';

  // Use toSignal to create signals from observables
  dashboardStats = toSignal(
    this.http.get<DashboardStats>(`${this.baseUrl}/dashboard-stats`)
      .pipe(
        catchError(error => {
          console.error('Error fetching dashboard stats:', error);
          return of(null);
        })
      )
  );

  userMoodStats = toSignal(
    this.http.get<UserMoodStats[]>(`${this.baseUrl}/moods/daily-users-last-month`)
      .pipe(
        catchError(error => {
          console.error('Error fetching mood stats:', error);
          return of([]);
        })
      )
  );

  blogStats = toSignal(
    this.http.get<DailyBlogsStats[]>(`${this.baseUrl}/blogs/daily-current-month`)
      .pipe(
        catchError(error => {
          console.error('Error fetching blog stats:', error);
          return of([]);
        })
      )
  );

  // For backward compatibility with the httpResource approach
  getAllStats() {
    return this.dashboardStats;
  }

  getAllUserMoodStats() {
    return this.userMoodStats;
  }

  getAllBlogsStats() {
    return this.blogStats;
  }
}
