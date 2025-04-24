import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mood } from '../models/mood.model';

export interface MoodState {
  id?: string;
  name: string;
  color: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MoodStateService {
  private http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl;
  getAllMoods(): Observable<Mood[]> {
    return this.http.get<Mood[]>(`${this.baseUrl}/mood-tracking`).pipe(
      catchError(error => {
        console.error('Error al obtener los estados de ánimo:', error);
        return of([]);
      })
    );
  }
  private moodStates = signal<MoodState[]>([
    { name: 'Happy', color: '#16a34a', enabled: true },
    { name: 'Neutral', color: '#2563eb', enabled: true },
    { name: 'Sad', color: '#dc2626', enabled: true },
    { name: 'Anxious', color: '#eab308', enabled: true },
    { name: 'Energetic', color: '#8b5cf6', enabled: true }
  ]);

  private trackingFrequency = signal<string>('Daily');
  private remindersEnabled = signal<boolean>(false);
  private retentionPeriod = signal<string>('1 month');
  private reminderTime = signal<string>('09:00');

  getMoodStates = this.moodStates.asReadonly();
  getTrackingFrequency = this.trackingFrequency.asReadonly();
  getRemindersEnabled = this.remindersEnabled.asReadonly();
  getRetentionPeriod = this.retentionPeriod.asReadonly();
  getReminderTime = this.reminderTime.asReadonly();


  addMoodState(mood: MoodState): void {
    this.moodStates.update(states => [...states, mood]);
  }

  updateMoodState(index: number, mood: MoodState): void {
    this.moodStates.update(states => {
      const updatedStates = [...states];
      updatedStates[index] = mood;
      return updatedStates;
    });
  }

  toggleMoodState(index: number): void {
    this.moodStates.update(states => {
      const updatedStates = [...states];
      updatedStates[index] = {
        ...updatedStates[index],
        enabled: !updatedStates[index].enabled
      };
      return updatedStates;
    });
  }

  updateTrackingFrequency(value: string): void {
    this.trackingFrequency.set(value);
  }

  updateRetentionPeriod(value: string): void {
    this.retentionPeriod.set(value);
  }

  updateRemindersEnabled(value: boolean): void {
    this.remindersEnabled.set(value);
  }

  updateReminderTime(value: string): void {
    this.reminderTime.set(value);
  }

  // Save all settings to backend (to be implemented)
  saveSettings(): Promise<boolean> {
    // This would make an HTTP request to save to backend
    return new Promise((resolve) => {
      console.log('Saved settings', {
        moods: this.moodStates(),
        trackingFrequency: this.trackingFrequency(),
        remindersEnabled: this.remindersEnabled(),
        reminderTime: this.reminderTime(),
        retentionPeriod: this.retentionPeriod(),
      });

      // Simulate API call
      setTimeout(() => {
        resolve(true);
      }, 800);
    });
  }
}
