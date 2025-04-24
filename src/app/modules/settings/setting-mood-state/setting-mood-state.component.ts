import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MoodModalComponent, MoodState } from '../components/mood-modal/mood-modal.component';
import { MoodStateService } from '../../../core/services/mood-tracking.service';

@Component({
  selector: 'setting-mood-state',
  imports: [CommonModule, FormsModule, MoodModalComponent],
  templateUrl: './setting-mood-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingMoodStateComponent {
  private moodStateService = inject(MoodStateService);

  loadMoodTracking = rxResource({
    loader: () => { return this.moodStateService.getAllMoods() }
  });

  constructor() {
    console.log("Mood Traidos", this.loadMoodTracking.value());
  }

  moodStates = this.moodStateService.getMoodStates;
  trackingFrequency = this.moodStateService.getTrackingFrequency;
  remindersEnabled = this.moodStateService.getRemindersEnabled;
  retentionPeriod = this.moodStateService.getRetentionPeriod;
  reminderTime = this.moodStateService.getReminderTime;

  editingMood: MoodState | null = null;
  editingIndex: number = -1;
  isNewMood = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  showSuccessToast = signal<boolean>(false);

  updateTrackingFrequency(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.moodStateService.updateTrackingFrequency(value);
  }

  updateRetentionPeriod(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.moodStateService.updateRetentionPeriod(value);
  }

  updateRemindersEnabled(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.moodStateService.updateRemindersEnabled(checked);
  }

  updateReminderTime(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.moodStateService.updateReminderTime(value);
  }

  addMoodState(): void {
    this.editingMood = { name: '', color: '#6d28d9', enabled: true };
    this.editingIndex = -2;
    this.isNewMood.set(true);

    setTimeout(() => {
      const modal = document.getElementById('mood_editor_modal') as HTMLDialogElement;
      if (modal) modal.showModal();
    });
  }

  toggleMood(index: number): void {
    this.moodStateService.toggleMoodState(index);
  }

  editMood(index: number): void {
    const mood = this.moodStates()[index];
    this.editingMood = { ...mood };
    this.editingIndex = index;
    this.isNewMood.set(false);

    setTimeout(() => {
      const modal = document.getElementById('mood_editor_modal') as HTMLDialogElement;
      if (modal) modal.showModal();
    });
  }

  handleSaveMood(mood: MoodState): void {
    if (this.isNewMood()) {
      this.moodStateService.addMoodState(mood);
    } else {
      this.moodStateService.updateMoodState(this.editingIndex, mood);
    }

    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingMood = null;
    this.editingIndex = -1;
  }

  async saveChanges(): Promise<void> {
    this.isSaving.set(true);

    try {
      await this.moodStateService.saveSettings();
      this.showSuccessToast.set(true);

      setTimeout(() => {
        this.showSuccessToast.set(false);
      }, 3000);
    } catch (error) {
      console.error('Error al guardar configuraciones', error);
      alert('No se pudieron guardar las configuraciones');
    } finally {
      this.isSaving.set(false);
    }
  }
}
