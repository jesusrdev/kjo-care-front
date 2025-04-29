import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MoodAnalyticsResponse } from '../interfaces/mood-analytics.response';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/mind/mood-tracking`;
  getMoodAnalytics(months: number = 3): Observable<MoodAnalyticsResponse> {
    return this.http
      .get<MoodAnalyticsResponse>(
        `${this.baseUrl}/user-mood/statistics?month=${months}`,
      )
      .pipe(
        tap((response) => {
          console.log('Analytics response', response);
        }),
        catchError((error) => {
          console.error('Error al traer las estadisticas', error);
          return throwError(
            () =>
              new Error(
                'Error la obtener las estadisticas de los estados de animo',
              ),
          );
        }),
      );
  }
}
