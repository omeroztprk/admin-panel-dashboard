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
