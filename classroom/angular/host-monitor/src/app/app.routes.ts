import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth.guards';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { HomePage } from './pages/home/home.page';
import { HostDetailsPage } from './pages/host-details/host-details.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';

export const routes: Routes = [
  { path: '', component: HomePage, canActivate: [guestGuard] },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: 'hosts/:id', component: HostDetailsPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
