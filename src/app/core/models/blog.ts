import { UserProfile } from './user-profile';

export interface Blog {
  id: number;
  title: string;
  content: string;
  image?: string;
  video?: string;
  publishedDate: string;
  modifiedDate: string;
  status: Status;
  author?: UserProfile;
  category?: Category;
  reactionCount?: number;
  commentCount?: number;
}

export enum Status {
  Draft = 'Draft',
  Published = 'Published',
  Deleted = 'Deleted',
}

export interface Category {
  id: number;
  name: string;
}

export interface Reaction {
  id: number;
  blogId: number;
  userId: number;
  type: string;
  reaction: string;
}

export interface Comment {
  id: number;
  blogId: number;
  userId: number;
  content: string;
  commentDate: string;
  commentParentId: number;
}

export interface FilterDTO {
  search: string;
  category: number;
  status: string;
}
