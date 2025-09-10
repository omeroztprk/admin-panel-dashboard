import { Permission } from './permission.model';

export interface Role {
  _id: string;
  name: string;
  displayName?: string;
  permissions: Permission[];
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  displayName?: string;
  permissions?: string[];
}
