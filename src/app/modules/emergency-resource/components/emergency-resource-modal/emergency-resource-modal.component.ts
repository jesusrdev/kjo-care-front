import { Component, effect, inject, output, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { EmergencyResourceService } from '../../../../core/services/emergency-resource.service';
import { FormUtils } from '../../../../shared/utils/form-utils';


@Component({
  selector: 'emergency-resource-modal',
  templateUrl: './emergency-resource-modal.component.html',
  imports: [
    ReactiveFormsModule
  ]
})
export class EmergencyResourceModalComponent {

  private fb = inject(FormBuilder);
  resourceService = inject(EmergencyResourceService);
  private toastService = inject(ToastService);

  reload = output();

  formUtils = FormUtils;

  title = signal('Add new blog');
  nameButton = signal('Save');

  resourceForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    image: [null],
    video: [null],
    contacts: [[''], [Validators.required]],
    links: [[''], [Validators.required]]
  });

  constructor() {
    effect(() => {
      this.title.set('Add new Emergency Resource');
      this.nameButton.set('Save');

      if (this.resourceService.selectedResource().id > 0) {
        this.title.set('Edit Emergency Resource');
        this.nameButton.set('Update');

        const resource = this.resourceService.selectedResource();

        this.resourceForm.patchValue({
          name: resource.name,
          description: resource.description,
          contacts: resource.contacts,
          links: resource.links
        });
      }
    });
  }

  onSubmit() {
    if (this.resourceForm.invalid) {
      this.resourceForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.resourceForm.value.name!);
    formData.append('description', this.resourceForm.value.description!);
    formData.append('contacts', this.resourceForm.value.contacts!.toString());
    formData.append('links', this.resourceForm.value.links!.toString());

    const image: any = this.resourceForm.get('image')?.value;
    const video: any = this.resourceForm.get('video')?.value;

    if (image instanceof File) {
      formData.append('imageUrl', image);
    }
    if (video instanceof File) {
      formData.append('videoUrl', video);
    }

    if (this.resourceService.selectedResource().id > 0) {
      return this.resourceService.update(formData, this.resourceService.selectedResource().id).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'Blog updated successfully',
              type: 'success',
              duration: 4000
            });

            this.reload.emit();
            this.resourceForm.reset();
            this.resourceForm.clearValidators();
          },
          error: (error) => {
            this.toastService.addToast({
              message: 'Error updating blog',
              type: 'error',
              duration: 4000
            });
          }
        });
    } else {
      return this.resourceService.create(formData).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'Blog created successfully',
              type: 'success',
              duration: 4000
            });

            this.reload.emit();
            this.resourceForm.reset();
            this.resourceForm.clearValidators();
          },
          error: (error) => {
            this.toastService.addToast({
              message: 'Error creating blog',
              type: 'error',
              duration: 4000
            });
          }
        });
    }
  }

  addInput(event: Event, field: 'contacts' | 'links') {
    const array = this.resourceForm.value[field] as string[];
    array.push('');
    this.resourceForm.patchValue({
      [field]: array
    });
    this.resourceForm.get(field)?.updateValueAndValidity();
  }

  removeInput(event: Event, index: number, field: 'contacts' | 'links') {
    const array = this.resourceForm.value[field] as string[];
    array.splice(index, 1);
    this.resourceForm.patchValue({
      [field]: array
    });
    this.resourceForm.get(field)?.updateValueAndValidity();
  }

  updateInput(event: Event, index: number, field: 'contacts' | 'links') {
    const input = event.target as HTMLInputElement;
    if (input.value && input.value.length > 0) {
      const array = this.resourceForm.value[field] as string[];
      array[index] = input.value;
      this.resourceForm.get(field)?.setValue(array);
      this.resourceForm.get(field)?.updateValueAndValidity();
    }
  }

  onFileChange(event: Event, field: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.resourceForm.patchValue({
        [field]: file
      });
      this.resourceForm.get(field)?.updateValueAndValidity();
    }
  }
}
