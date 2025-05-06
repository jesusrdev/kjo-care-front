import { Component, effect, inject, output, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { CategoryService } from '../../../../core/services/category.service';
import { FormUtils } from '../../../../shared/utils/form-utils';
import { Category } from '../../../../core/models/blog';

@Component({
  selector: 'category-modal',
  templateUrl: './category-modal.component.html',
  imports: [
    ReactiveFormsModule
  ]
})
export class CategoryModalComponent {

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  reload = output();

  formUtils = FormUtils;


  title = signal('Add new user');
  nameButton = signal('Save');

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });


  constructor() {
    effect(() => {
      this.title.set('Add new category');
      this.nameButton.set('Save');

      if (this.categoryService.selectedCategory().id > 0) {
        this.title.set('Edit Category');
        this.nameButton.set('Update');
      }

      this.categoryForm.patchValue({
        name: this.categoryService.selectedCategory().name
      });
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    const request: Category = {
      id: this.categoryService.selectedCategory().id,
      name: this.categoryForm.value.name!
    };

    if (this.categoryService.selectedCategory().id > 0) {
      this.categoryService.update(request, request.id).subscribe({
        next: () => {
          this.toastService.addToast({
            message: 'Category updated successfully',
            type: 'success',
            duration: 4000
          });

          this.reload.emit();
          this.categoryForm.reset();
          this.categoryForm.clearValidators();
        },
        error: (error) => {
          this.toastService.addToast({
            message: 'Error updating category',
            type: 'error',
            duration: 4000
          });
        }
      });
    } else {
      this.categoryService.create(request).subscribe({
        next: () => {
          this.toastService.addToast({
            message: 'Category created successfully',
            type: 'success',
            duration: 4000
          });

          this.reload.emit();
          this.categoryForm.reset();
          this.categoryForm.clearValidators();
        },
        error: (error) => {
          this.toastService.addToast({
            message: 'Error creating category',
            type: 'error',
            duration: 4000
          });
        }
      });
    }
  }
}
