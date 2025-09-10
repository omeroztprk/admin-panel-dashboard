import { Routes } from '@angular/router';

export const categoryRoutes: Routes = [
  { path: '', loadComponent: () => import('./category-list/category-list').then(m => m.CategoryList) },
  { path: 'new', loadComponent: () => import('./category-form/category-form').then(m => m.CategoryForm) },
  { path: 'tree', loadComponent: () => import('./category-tree/category-tree').then(m => m.CategoryTree) },
  { path: ':id', loadComponent: () => import('./category-detail/category-detail').then(m => m.CategoryDetail) },
  { path: ':id/edit', loadComponent: () => import('./category-form/category-form').then(m => m.CategoryForm) }
];