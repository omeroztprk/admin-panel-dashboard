import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { ProfileDetail } from './profile-detail/profile-detail';
import { ProfileUpdate } from './profile-update/profile-update';

export const profileRoutes: Routes = [
  { path: '', component: ProfileDetail, canActivate: [authGuard] },
  { path: 'edit', component: ProfileUpdate, canActivate: [authGuard] }
];