export interface UserRequest {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

export interface UserResponse extends Exclude<UserRequest, 'password'> {
  id: string;
  createdTimestamp: number;
  enabled: boolean;
}

export interface UserInfo extends Exclude<UserRequest, 'password,roles,email'> {
}
