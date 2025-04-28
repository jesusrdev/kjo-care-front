import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Content, Mood } from '../models/mood.model';
import type { MoodStateRequest, MoodStateResponse } from '../interfaces/mood-http.interface';

@Injectable({
  providedIn: 'root'
})
export class MoodStateService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/mind`;

  private moodStates = signal<Content[]>([]);
  private isLoading = signal<boolean>(false);
  private error = signal<string | null>(null);

  private trackingFrequency = signal<string>('Daily');
  private remindersEnabled = signal<boolean>(false);
  private retentionPeriod = signal<string>('1 month');
  private reminderTime = signal<string>('09:00');

  getMoodStates = this.moodStates.asReadonly();
  getIsLoading = this.isLoading.asReadonly();
  getError = this.error.asReadonly();
  getTrackingFrequency = this.trackingFrequency.asReadonly();
  getRemindersEnabled = this.remindersEnabled.asReadonly();
  getRetentionPeriod = this.retentionPeriod.asReadonly();
  getReminderTime = this.reminderTime.asReadonly();

  getEnabledMoodsCount = computed(() =>
    this.moodStates().filter(mood => mood.isActive).length
  );

  getAllMoods(): Observable<Mood> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<Mood>(`${this.baseUrl}/mood-tracking`).pipe(
      tap(resp => {
        console.log("Trayendo los estados de animo", resp);
        this.moodStates.set(resp.content);
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error('Error al obtener los estados de ánimo:', error);
        this.error.set('Error al cargar los estados de ánimo');
        this.isLoading.set(false);
        return throwError(() => new Error("Error al traer los estados de animo"));
      })
    );
  }

  addMoodState(mood: MoodStateRequest): Observable<MoodStateResponse> {
    this.isLoading.set(true);

    return this.http.post<MoodStateResponse>(`${this.baseUrl}/mood-tracking`, mood).pipe(
      tap(response => {
        this.moodStates.update(states => [
          ...states,
          {
            id: response.id,
            name: response.name,
            description: response.description,
            image: response.image,
            color: response.color,
            isActive: response.isActive,
            state: 'active'
          }
        ]);
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error("Error al crear un estado de animo", error);
        this.isLoading.set(false);
        return throwError(() => new Error(`Error al crear un estado de animo`));
      })
    );
  }

  updateMoodState(id: number, mood: MoodStateRequest): Observable<MoodStateResponse> {
    this.isLoading.set(true);

    return this.http.patch<MoodStateResponse>(`${this.baseUrl}/mood-tracking/${id}`, mood).pipe(
      tap(response => {
        // Actualizar el estado local
        this.moodStates.update(states =>
          states.map(item =>
            item.id === id ? {
              ...item,
              name: response.name,
              description: response.description,
              image: response.image,
              color: response.color,
              isActive: response.isActive
            } : item
          )
        );
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error(`Error al actualizar el estado de animo ${id}`, error);
        this.isLoading.set(false);
        return throwError(() => new Error(`Error al actualizar el estado de animo de id : ${id}`));
      })
    );
  }

  toggleMoodState(id: number): Observable<MoodStateResponse> {
    return this.http.patch<MoodStateResponse>(`${this.baseUrl}/mood-tracking/${id}/toggle-status`, {}).pipe(
      catchError(error => {
        console.error(`Error al desactivar el estado de animo de id : ${id}`)
        return throwError(() => new Error(`Error al cambiar el estado a una emocion de id: ${id}`, error.message))
      }
      )
    )
  }


  removeMoodState(id: number): Observable<void> {
    this.isLoading.set(true);

    return this.http.delete<void>(`${this.baseUrl}/mood-tracking/${id}`).pipe(
      tap(() => {
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error(`Error al eliminar el estado de animo de id : ${id}`, error);
        this.isLoading.set(false);
        return throwError(() => new Error(`Error al eliminar el estado de animo de id ${id}`));
      })
    );
  }
}
