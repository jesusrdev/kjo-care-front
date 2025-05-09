import { UserInfo } from './user-http.interface';

export interface HealthCenterRequest {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
}

export interface HealthCenterResponse extends HealthCenterRequest {
  id: number;
  user: UserInfo;
  status: string;
  createdDate: string;
  modifiedDate: string;
}
