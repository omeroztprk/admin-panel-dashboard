import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./customer-list/customer-list').then(m => m.CustomerList)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./customer-form/customer-form').then(m => m.CustomerForm)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./customer-detail/customer-detail').then(m => m.CustomerDetail)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./customer-form/customer-form').then(m => m.CustomerForm)
  }
];