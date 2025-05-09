export interface CommentRequest {
  id: number;
  content: string;
  blogId: number;
  commentParentId: number | null;
}

export interface CommentResponse {
  id: number;
  blogId: number;
  userId: number;
  content: string;
  commentDate: string;
  modifiedDate: string;
  commentParentId: number;
}
