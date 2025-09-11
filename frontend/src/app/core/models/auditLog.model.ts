export interface PopulatedAuditUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AuditLog {
  _id: string;
  user?: PopulatedAuditUser;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  createdAt: string;
}
