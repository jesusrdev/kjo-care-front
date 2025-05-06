import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, input } from '@angular/core';
import { CommentSummary } from '../../../../core/interfaces/blog-http.interface';
import { ModalOpenButtonComponent } from '../../../../shared/components/modal-open-button/modal-open-button.component';
import { CommentService } from '../../../../core/services/comment.service';
import { BlogService } from '../../../../core/services/blog.service';
import { CommentRequest } from '../../../../core/interfaces/comment-http.interface';

@Component({
  selector: 'blog-comment',
  templateUrl: './blog-comment.component.html',
  imports: [
    ModalOpenButtonComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BlogCommentComponent {
  readonly comment = input.required<CommentSummary>();
  readonly commentParentId = input.required<number | null>();

  readonly blogService = inject(BlogService);

  commentService = inject(CommentService);

  readonly userLetters = computed<string>(() => {
    const firstName: string = this.comment().userId.firstName ?? '?';
    const lastName: string = this.comment().userId.lastName ?? '?';
    return firstName[0] + lastName[0];
  });

  selectComment(type: 'edit' | 'reply' | 'create' | 'delete'): CommentRequest {
    switch (type) {
      case 'edit':
        return {
          id: this.comment().id,
          content: this.comment().content,
          blogId: this.blogService.selectedBlog.blog.id,
          commentParentId: this.commentParentId()
        };
      case 'reply':
        return {
          id: 0,
          content: '',
          blogId: this.blogService.selectedBlog.blog.id,
          commentParentId: this.comment().id
        };
      case 'create':
        return {
          id: 0,
          content: this.comment().content,
          blogId: this.blogService.selectedBlog.blog.id,
          commentParentId: null
        };
        case 'delete':
          return {
            id: this.comment().id,
            content: this.comment().content,
            blogId: this.blogService.selectedBlog.blog.id,
            commentParentId: null
          };
    }
  }
}
