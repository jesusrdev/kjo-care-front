import { Blog } from '../models/blog';
import { UserInfo } from './user-http.interface';

export interface BlogResponse {
  blog: Blog;
  reactionCount: number;
  commentCount: number;
}

export interface BlogDetailResponse {
  blog: Blog;
  reactionCount: number;
  commentCount: number;
  comments: CommentSummary[];
  accesible: boolean;
}

export interface CommentSummary {
  id: number;
  userId: UserInfo;
  content: string;
  date: string;
  commentDate: string;
  modifiedDate: string;
  childrenComments: CommentSummary[];
}
