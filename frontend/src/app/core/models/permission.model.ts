export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionRequest {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  resource?: string;
  action?: string;
  description?: string;
}
