import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { TfaVerify } from './tfa-verify/tfa-verify';

export const authRoutes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'tfa-verify', component: TfaVerify },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];