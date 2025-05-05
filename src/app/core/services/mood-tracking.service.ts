import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Content, Mood } from '../models/mood.model';
import type {
  MoodStateRequest,
  MoodStateResponse,
} from '../interfaces/mood-http.interface';

@Injectable({
  providedIn: 'root',
})
export class MoodStateService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  private moodStates = signal<Content[]>([]);

  getAllMoods(): Observable<Mood> {
    return this.http.get<Mood>(`${this.baseUrl}/mood-tracking`).pipe(
      catchError((error) => {
        console.error('Error al obtener los estados de ánimo:', error);
        return throwError(
          () => new Error('Error al traer los estados de animo'),
        );
      }),
    );
  }

  addMoodState(mood: MoodStateRequest): Observable<MoodStateResponse> {
    return this.http
      .post<MoodStateResponse>(`${this.baseUrl}/mood-tracking`, mood)
      .pipe(
        tap((response) => {
          this.moodStates.update((states) => [
            ...states,
            {
              id: response.id,
              name: response.name,
              description: response.description,
              image: response.image,
              color: response.color,
              isActive: response.isActive,
              state: 'active',
            },
          ]);
        }),
        catchError((error) => {
          console.error('Error al crear un estado de animo', error);
          return throwError(
            () => new Error(`Error al crear un estado de animo`),
          );
        }),
      );
  }

  updateMoodState(
    id: number,
    mood: MoodStateRequest,
  ): Observable<MoodStateResponse> {
    return this.http
      .patch<MoodStateResponse>(`${this.baseUrl}/mood-tracking/${id}`, mood)
      .pipe(
        tap((response) => {
          this.moodStates.update((states) =>
            states.map((item) =>
              item.id === id
                ? {
                    ...item,
                    name: response.name,
                    description: response.description,
                    image: response.image,
                    color: response.color,
                    isActive: response.isActive,
                  }
                : item,
            ),
          );
        }),
        catchError((error) => {
          console.error(`Error al actualizar el estado de animo ${id}`, error);
          return throwError(
            () =>
              new Error(`Error al actualizar el estado de animo de id : ${id}`),
          );
        }),
      );
  }

  toggleMoodState(id: number): Observable<MoodStateResponse> {
    return this.http
      .patch<MoodStateResponse>(
        `${this.baseUrl}/mood-tracking/${id}/toggle-status`,
        {},
      )
      .pipe(
        catchError((error) => {
          console.error(`Error al desactivar el estado de animo de id : ${id}`);
          return throwError(
            () =>
              new Error(
                `Error al cambiar el estado a una emocion de id: ${id}`,
                error.message,
              ),
          );
        }),
      );
  }

  removeMoodState(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/mood-tracking/${id}`).pipe(
      catchError((error) => {
        console.error(
          `Error al eliminar el estado de animo de id : ${id}`,
          error,
        );
        return throwError(
          () => new Error(`Error al eliminar el estado de animo de id ${id}`),
        );
      }),
    );
  }
}
