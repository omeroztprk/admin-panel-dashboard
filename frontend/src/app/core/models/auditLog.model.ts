export interface AuditLog {
  _id: string;
  user?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  createdAt: Date;
}
