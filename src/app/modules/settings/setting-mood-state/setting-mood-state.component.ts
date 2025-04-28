import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MoodModalComponent } from '../components/mood-modal/mood-modal.component';
import { MoodStateService } from '../../../core/services/mood-tracking.service';
import type { Content } from '../../../core/models/mood.model';
import type { MoodStateRequest } from '../../../core/interfaces/mood-http.interface';

@Component({
  selector: 'setting-mood-state',
  imports: [CommonModule, FormsModule, MoodModalComponent],
  templateUrl: './setting-mood-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingMoodStateComponent {
  private moodStateService = inject(MoodStateService);

  loadMoodTracking = rxResource({
    loader: () => this.moodStateService.getAllMoods()
  });

  constructor() {
    effect(() => {
      this.loadMoodTracking.reload();
    });

    effect(() => {
      if (this.showSuccessToast()) {
        setTimeout(() => this.showSuccessToast.set(false), 3000);
      }
    });
  }

  editingMood = signal<Content | null>(null);
  editingIndex = signal<number>(-1);
  isNewMood = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  showSuccessToast = signal<boolean>(false);
  successMessage = signal<string>('Configuración guardada exitosamente!');
  deletingMoodId = signal<number | null>(null);

  addMoodState(): void {
    const newMood: Content = {
      id: 0,
      name: '',
      description: '',
      state: 'active',
      image: '',
      color: '#6d28d9',
      isActive: true
    };

    this.editingMood.set(newMood);
    this.isNewMood.set(true);

    setTimeout(() => {
      const modal = document.getElementById('mood_editor_modal') as HTMLDialogElement;
      if (modal) modal.showModal();
    });
  }

  toggleMoodState(id: number): void {
    this.isSaving.set(true);

    this.moodStateService.toggleMoodState(id).subscribe({
      next: (response) => {
        this.loadMoodTracking.update(currentData => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            content: currentData.content.map(mood =>
              mood.id === id ? { ...mood, isActive: response.isActive } : mood
            )
          };
        });

        this.successMessage.set('Estado actualizado correctamente');
        this.showSuccessToast.set(true);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.isSaving.set(false);
      }
    });
  }

  editMood(index: number): void {
    const mood = this.loadMoodTracking.value()?.content[index]!;
    this.editingMood.set({ ...mood });
    this.editingIndex.set(index);
    this.isNewMood.set(false);

    setTimeout(() => {
      const modal = document.getElementById('mood_editor_modal') as HTMLDialogElement;
      if (modal) modal.showModal();
    });
  }

  deleteMood(id: number): void {
    this.deletingMoodId.set(id);
    const modal = document.getElementById('delete_confirmation_modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  confirmDelete(): void {
    const id = this.deletingMoodId();
    if (!id) return;

    this.isSaving.set(true);

    this.moodStateService.removeMoodState(id).subscribe({
      next: () => {
        this.loadMoodTracking.update(currentData => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            content: currentData.content.filter(mood => mood.id !== id)
          };
        });
        this.successMessage.set('Estado de ánimo eliminado correctamente');
        this.showSuccessToast.set(true);
        this.isSaving.set(false);
        const modal = document.getElementById('delete_confirmation_modal') as HTMLDialogElement;
        if (modal) modal.close();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert('No se pudo eliminar el estado de ánimo');
      }
    });
  }

  handleSaveMood(mood: Content): void {
    const moodRequest: MoodStateRequest = {
      name: mood.name,
      description: mood.description,
      color: mood.color,
      image: mood.image || ''
    };

    this.isSaving.set(true);

    if (this.isNewMood()) {
      this.moodStateService.addMoodState(moodRequest).subscribe({
        next: (response) => {
          // Actualizar la UI inmediatamente después de crear
          this.loadMoodTracking.update(currentData => {
            if (!currentData) return currentData;

            const newMood: Content = {
              id: response.id,
              name: response.name,
              description: response.description,
              image: response.image,
              color: response.color,
              isActive: response.isActive,
              state: 'active'
            };

            return {
              ...currentData,
              content: [...currentData.content, newMood]
            };
          });

          this.successMessage.set('Estado de ánimo creado correctamente');
          this.showSuccessToast.set(true);
          this.isSaving.set(false);
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error al crear estado de ánimo:', err);
          this.isSaving.set(false);
          alert('No se pudo crear el estado de ánimo');
        }
      });
    } else {
      const id = this.editingMood()?.id;
      if (!id) return;

      this.moodStateService.updateMoodState(id, moodRequest).subscribe({
        next: (response) => {
          this.loadMoodTracking.update(currentData => {
            if (!currentData) return currentData;

            return {
              ...currentData,
              content: currentData.content.map(item =>
                item.id === id ? {
                  ...item,
                  name: response.name,
                  description: response.description,
                  image: response.image,
                  color: response.color,
                  isActive: response.isActive
                } : item
              )
            };
          });

          this.successMessage.set('Estado de ánimo actualizado correctamente');
          this.showSuccessToast.set(true);
          this.isSaving.set(false);
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error al actualizar estado de ánimo:', err);
          this.isSaving.set(false);
          alert('No se pudo actualizar el estado de ánimo');
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingMood.set(null);
    this.editingIndex.set(-1);
  }
}
