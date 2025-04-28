export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  createdTimestamp?: number;
  token?: string;
}
