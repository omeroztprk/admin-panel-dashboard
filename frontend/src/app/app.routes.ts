import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(m => m.profileRoutes)
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/sessions/sessions').then(m => m.SessionsList)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/user/user.routes').then(m => m.userRoutes)
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/role/role.routes').then(m => m.roleRoutes)
      },
      {
        path: 'permissions',
        loadChildren: () =>
          import('./features/permission/permission.routes').then(m => m.permissionRoutes)
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/category/category.routes').then(m => m.categoryRoutes)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '/auth/login' }
];
