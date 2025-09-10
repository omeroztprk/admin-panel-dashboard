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

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
  password?: string;
}