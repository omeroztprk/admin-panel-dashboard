import { Routes } from '@angular/router';

export const permissionRoutes: Routes = [
  { path: '', loadComponent: () => import('./permission-list/permission-list').then(m => m.PermissionList) },
  { path: 'new', loadComponent: () => import('./permission-form/permission-form').then(m => m.PermissionForm) },
  { path: ':id', loadComponent: () => import('./permission-detail/permission-detail').then(m => m.PermissionDetail) },
  { path: ':id/edit', loadComponent: () => import('./permission-form/permission-form').then(m => m.PermissionForm) }
];