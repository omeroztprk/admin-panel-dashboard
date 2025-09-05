export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isSystem?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
