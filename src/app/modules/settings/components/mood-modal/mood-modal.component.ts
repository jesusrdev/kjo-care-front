import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
export interface MoodState {
  name: string;
  color: string;
  enabled: boolean;
  description?: string;
  state?: string;
}
@Component({
  selector: 'app-mood-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mood-modal.component.html',
  styles: `
  .color-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodModalComponent implements OnInit {
  modalId = input<string>("mood_editor_modal");
  mood = input<MoodState>({ name: "", color: "#6d28d9", enabled: true, description: "", state: "active" });
  isNewMood = input<boolean>(false);

  save = output<MoodState>();
  cancel = output<void>();

  moodForm!: FormGroup;

  states = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente Revision' }
  ];


  colorPresets: string[] = [
    "#FF5252", "#E040FB", "#7C4DFF", "#536DFE",
    "#448AFF", "#40C4FF", "#18FFFF",
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const currentMood = this.mood();

    this.moodForm = this.fb.group({
      name: [currentMood.name, [Validators.required, Validators.minLength(2)]],
      color: [currentMood.color, Validators.required],
      description: [currentMood.description || ''],
      state: [currentMood.state || 'active', Validators.required],
      enabled: [currentMood.enabled]
    });
  }

  setMoodColor(color: string): void {
    this.moodForm.patchValue({ color });
  }

  saveMood(): void {
    if (this.moodForm.invalid) {
      Object.keys(this.moodForm.controls).forEach(key => {
        const control = this.moodForm.get(key);
        control?.markAsTouched();
      });

      return;
    }

    const updatedMood: MoodState = {
      ...this.moodForm.value
    };

    this.save.emit(updatedMood);
    this.closeModal();
  }

  cancelEdit(): void {
    this.cancel.emit();
    this.closeModal();
  }

  closeModal(): void {
    const modal = document.getElementById(this.modalId()) as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  }

  get nameControl() { return this.moodForm.get('name'); }
  get colorControl() { return this.moodForm.get('color'); }
  get stateControl() { return this.moodForm.get('state'); }
}
