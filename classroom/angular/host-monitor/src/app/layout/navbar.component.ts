import { Component, computed, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.navbar-dark]="theme() === 'dark'">
      <a class="brand" [routerLink]="auth.isAuthenticated() ? '/dashboard' : '/'"> HOST MONITOR </a>

      @if (auth.isAuthenticated()) {
        <div class="nav-actions auth-actions">
          <a
            routerLink="/dashboard"
            routerLinkActive="active-link"
            [routerLinkActiveOptions]="{ exact: true }"
            >Dashboard</a
          >
          @if (showDetails()) {
            <span class="active-link">Detalhes</span>
          }
          <a href="/api/docs" target="_blank" rel="noreferrer">API Docs</a>
          @if (auth.user()?.name) {
            <span class="user-name">{{ auth.user()?.name }}</span>
          }
          <button type="button" class="link-button" (click)="logout()">Sair</button>
        </div>
      } @else {
        <div class="nav-actions">
          <a routerLink="/login" routerLinkActive="primary-link">Login</a>
          <a routerLink="/register" routerLinkActive="primary-link">Cadastro</a>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent {
  readonly theme = input<'light' | 'dark'>('light');
  readonly context = input<'public' | 'dashboard' | 'details'>('public');
  readonly showDetails = computed(() => this.context() === 'details');

  constructor(
    readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
