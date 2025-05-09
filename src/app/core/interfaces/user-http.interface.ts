export interface UserRequest {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

export interface UserResponse extends Omit<UserRequest, 'password'> {
  id: string;
  createdTimestamp: number;
  enabled: boolean;
}

export type UserInfo = Omit<UserRequest, 'password' | 'roles' | 'email'> ;
