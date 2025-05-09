import { UserInfo } from './user-http.interface';

export interface EmergencyResourceRequest {
  name: string;
  description: string;
  videoUrl: string;
  imageUrl: string;
  contacts: string[];
  links: string[];
}

export interface EmergencyResourceResponse {
  id: number;
  user: UserInfo;
  name: string;
  description: string;
  resourceUrl?: string;
  contacts: string[];
  links: string[];
  status: string;
  accessCount: number;
  createdDate: string;
  modifiedDate: string;
}

export interface EmergencyResourceStats {
  totalResources: number;
  activeEmergencies: number;
  totalContacts: number;
  totalLinks: number;
  totalAccesses: number;
}
