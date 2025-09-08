import { Role } from './role.model';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  isActive: boolean;
  lastLogin?: string;    
  avatar: string;
  fullName?: string;
  createdAt?: string;       
  updatedAt?: string;       
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  currentPassword?: string;
  newPassword?: string;
}