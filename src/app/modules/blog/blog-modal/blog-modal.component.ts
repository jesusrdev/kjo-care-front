import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Blog, Category, Status } from '../../../core/models/blog';

import { FormUtils } from '../../../shared/utils/form-utils';
import { BlogService } from '../../../core/services/blog.service';

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

  formUtils = FormUtils;

  blog = input<Blog>();
  categories = input.required<Category[]>();

  title = signal('Add new blog');
  nameButton = signal('Save');
  nameModal = input<string>('modal_blog_create');

  message = signal<string | null>(null);

  blogForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(5)]],
    image: [null],
    video: [null],
    category: [0, [Validators.required, Validators.min(1)]],
    status: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.nameModal() == 'modal_blog_edit') {
      this.title.set('Edit blog');
      this.nameButton.set('Update');
    }
  }

  onSubmit() {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    console.log(this.blogForm.value);

    setTimeout(() => {
      this.message.set('¡Guardado!');
    }, 2000);

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

  onValueChanges = effect(() => {
    if (this.blog()) {
      this.blogForm.patchValue({
        title: this.blog()?.title,
        content: this.blog()?.content,
        category: this.blog()?.category?.id,
        status: this.blog()?.status
      });
    }
  });

  clearMessage = effect(() => {
    this.message();
    setTimeout(() => {
      this.message.set(null);
    }, 3000);
  });
}
