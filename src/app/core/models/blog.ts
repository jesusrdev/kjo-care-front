import { UserProfile } from './user-profile';

export interface Blog {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  content: string;
  image?: string;
  video?: string;
  publishedDate: string;
  modificationDate: string;
  status: Status;
  user?: UserProfile;
  category?: Category;
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
