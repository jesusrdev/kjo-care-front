import { Component, inject } from '@angular/core';
import { BlogService } from '../../../core/services/blog.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { BlogCommentComponent } from './blog-comment/blog-comment.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { CommentService } from '../../../core/services/comment.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalOpenButtonComponent } from '../../../shared/components/modal-open-button/modal-open-button.component';
import { BlogCommentModalComponent } from '../blog-comment-modal/blog-comment-modal.component';

@Component({
  selector: 'blog-comments-modal',
  templateUrl: './blog-comments-modal.component.html',
  imports: [
    BlogCommentComponent,
    DialogComponent,
    ModalOpenButtonComponent,
    BlogCommentModalComponent
  ]
})
export class BlogCommentsModalComponent {
  blogService = inject(BlogService);
  commentService = inject(CommentService);
  toastService = inject(ToastService);

  readonly blog = rxResource({
    request: () => this.blogService.selectedBlog.blog.id,
    loader: ({ request }) => this.blogService.getById(request)
  });

  deleteComment() {
    this.commentService.delete(this.commentService.selectedComment.id).subscribe({
      next: () => {
        this.blog.reload();
      },
      error: (error) => {
        this.toastService.addToast({
          message: 'Error deleting comment',
          type: 'error',
          duration: 4000
        });
      }
    });
  }

  reload() {
    this.blog.reload();
  }
}
