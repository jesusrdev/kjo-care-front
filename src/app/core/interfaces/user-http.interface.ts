export interface UserRequest {
  // username: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
}

export interface UserResponse extends UserRequest {
  id: string;
  createdTimestamp: number;
  enabled: boolean;
}
