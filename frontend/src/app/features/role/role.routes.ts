import { Routes } from '@angular/router';

export const roleRoutes: Routes = [
  { path: '', loadComponent: () => import('./role-list/role-list').then(m => m.RoleList) },
  { path: 'new', loadComponent: () => import('./role-form/role-form').then(m => m.RoleForm) },
  { path: ':id', loadComponent: () => import('./role-detail/role-detail').then(m => m.RoleDetail) },
  { path: ':id/edit', loadComponent: () => import('./role-form/role-form').then(m => m.RoleForm) }
];