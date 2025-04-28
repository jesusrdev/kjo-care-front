import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Blog, Category, Status } from '../../../core/models/blog';

import { FormUtils } from '../../../shared/utils/form-utils';
import { BlogService } from '../../../core/services/blog.service';
import { ToastService } from '../../../core/services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'blog-modal',
  templateUrl: './blog-modal.component.html',
  imports: [
    ReactiveFormsModule,
    NgClass
  ]
})
export class BlogModalComponent implements OnInit {

  protected readonly Status = Status;

  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  private toastService = inject(ToastService);

  reload = output();

  formUtils = FormUtils;

  blog = input<Blog>();
  categories = input.required<Category[]>();
  type = input<'create' | 'edit'>('create');

  title = signal('Add new blog');
  nameButton = signal('Save');
  nameModal = computed(() => this.type() === 'create' ? 'modal_blog_create' : 'modal_blog_edit');

  message = signal<string | null>(null);

  blogForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(5)]],
    image: [null],
    video: [null],
    categoryId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    if (this.type() == 'edit') {
      this.title.set('Edit blog');
      this.nameButton.set('Update');
    }
  }

  constructor() {
    effect(() => {
      if (this.blog()) {
        this.blogForm.patchValue({
          title: this.blog()?.title,
          content: this.blog()?.content,
          categoryId: this.blog()?.category?.id
        });
      }
    });
  }

  //create a factory function

  onSubmit() {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    console.log(this.blogForm.value);


    const formData = new FormData();
    formData.append('title', this.blogForm.value.title);
    formData.append('content', this.blogForm.value.content);

    const image = this.blogForm.get('image')?.value;
    const video = this.blogForm.get('video')?.value;

    if (image instanceof File) {
      formData.append('image', image);
    }
    if (video instanceof File) {
      formData.append('video', video);
    }
    formData.append('categoryId', this.blogForm.value.categoryId);

    console.table(formData);

    if (this.blog()) {
      return this.blogService.update(formData, this.blog()!.id).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'Blog updated successfully',
              type: 'success',
              duration: 3000
            });

            this.reload.emit();
          },
          error: (error) => {
            this.toastService.addToast({
              message: 'Error updating blog',
              type: 'error',
              duration: 3000
            });
          }
        });
    } else {
      return this.blogService.create(formData).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'Blog created successfully',
              type: 'success',
              duration: 3000
            });

            this.reload.emit();
          },
          error: (error) => {
            this.toastService.addToast({
              message: 'Error creating blog',
              type: 'error',
              duration: 3000
            });
          }
        });
    }

    // this.blogForm.reset(
    //   {
    //     title: '',
    //     content: '',
    //     image: null,
    //     video: null,
    //     category: '',
    //     status: ''
    //   }
    // );
  }

  onFileChange(event: Event, field: 'image' | 'video') {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.blogForm.patchValue({
        [field]: file
      });
      this.blogForm.get(field)?.updateValueAndValidity();
    }
  }
}
