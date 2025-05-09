import { Component, effect, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormUtils } from '../../../shared/utils/form-utils';

@Component({
  selector: 'blog-comment-modal',
  templateUrl: './blog-comment-modal.component.html',
  imports: [
    ReactiveFormsModule
  ]
})
export class BlogCommentModalComponent {

  private fb = inject(FormBuilder);
  private commentService = inject(CommentService);
  private toastService = inject(ToastService);

  reload = output();

  title = signal('Add new comment');
  nameButton = signal('Save');

  commentForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor() {
    effect(() => {
      this.title.set('Add new comment');
      this.nameButton.set('Save');

      if (this.commentService._selectedComment().id > 0) {
        this.title.set('Edit comment');
        this.nameButton.set('Update');

        this.commentForm.patchValue({
          content: this.commentService.selectedComment.content
        });
      }

      if (this.commentService._selectedComment().commentParentId && this.commentService._selectedComment().id < 1) {
        this.title.set('Reply to comment');
        this.nameButton.set('Reply');
        this.commentForm.patchValue({
          content: ''
        });
      }
    });
  }

  onSubmit() {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      console.log('Form invalid');
      return;
    }

    const request = {
      id: this.commentService.selectedComment.id,
      content: this.commentForm.value.content!,
      blogId: this.commentService.selectedComment.blogId,
      commentParentId: this.commentService.selectedComment.commentParentId
    };

    if (this.commentService.selectedComment.id > 0) {
      return this.commentService.update(request, this.commentService.selectedComment.id).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'Comment updated successfully',
              type: 'success',
              duration: 4000
            });

            this.reloadComments();
            this.commentForm.reset();
            this.commentForm.clearValidators();
          },
          error: (error) => {
            this.toastService.addToast({
              message: error.message || 'Error updating comment',
              type: 'error',
              duration: 4000
            });
          }
        });
    } else {
      return this.commentService.create(request).pipe()
        .subscribe({
          next: () => {
            this.toastService.addToast({
              message: 'Comment created successfully',
              type: 'success',
              duration: 4000
            });

            this.reloadComments();
            this.commentForm.reset();
            this.commentForm.clearValidators();
          },
          error: (error) => {
            this.toastService.addToast({
              message: error.message || 'Error creating comment',
              type: 'error',
              duration: 4000
            });
          }
        });
    }
  }

  reloadComments() {
    this.reload.emit();
  }

  protected readonly formUtils = FormUtils;
}
