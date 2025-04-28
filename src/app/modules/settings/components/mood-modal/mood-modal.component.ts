import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Content } from '../../../../core/models/mood.model';

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
  mood = input<Content>({
    id: 0,
    name: "",
    color: "#6d28d9",
    isActive: true,
    description: "",
    state: "active",
    image: ""
  });
  isNewMood = input<boolean>(false);

  save = output<Content>();
  cancel = output<void>();

  moodForm!: FormGroup;


  colorPresets: string[] = [
    "#FF5252", "#E040FB", "#7C4DFF", "#536DFE",
    "#448AFF", "#40C4FF", "#18FFFF"
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

    const updatedMood: Content = {
      ...this.mood(),
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
  get isActiveControl() { return this.moodForm.get('isActive'); }
}
