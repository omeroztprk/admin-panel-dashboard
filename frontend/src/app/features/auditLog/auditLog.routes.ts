import { Routes } from '@angular/router';

export const auditLogRoutes: Routes = [
  { path: '', loadComponent: () => import('./auditLog-list/auditLog-list').then(m => m.AuditLogList) },
  { path: ':id', loadComponent: () => import('./auditlog-detail/auditlog-detail').then(m => m.AuditLogDetail) }
];