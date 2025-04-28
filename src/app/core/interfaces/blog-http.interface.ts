import { Blog, Comment } from '../models/blog';

export interface BlogResponse {
  blog: Blog;
  reactionCount: number;
  commentCount: number;
}

export interface BlogDetailResponse {
  blog: Blog;
  reactionCount: number;
  commentCount: number;
  comments: Comment[];
  accesible: boolean;
}
