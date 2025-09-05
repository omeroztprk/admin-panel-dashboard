import { Role } from './role.model';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[] | string[];
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string;
  fullName?: string;
  initials?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
