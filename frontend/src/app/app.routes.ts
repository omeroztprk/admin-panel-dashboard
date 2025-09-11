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
        path: 'statistics',
        loadComponent: () =>
          import('./features/statistics/statistics').then(m => m.Stats)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(m => m.profileRoutes)
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/session/session-list').then(m => m.SessionList)
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
      {
        path: 'audit-logs',
        loadChildren: () =>
          import('./features/auditLog/auditLog.routes').then(m => m.auditLogRoutes)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '/auth/login' }
];
