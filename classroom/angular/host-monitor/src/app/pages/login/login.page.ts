import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ApiError } from '../../core/models';
import { NavbarComponent } from '../../layout/navbar.component';

@Component({
  selector: 'app-login-page',
  imports: [NavbarComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-navbar />
    <main class="auth-layout">
      <section>
        <h1>Entrar</h1>
        <p>
          Acesse seu dashboard para consultar hosts, executar checks e acompanhar o histórico de
          disponibilidade.
        </p>
      </section>

      <section class="panel">
        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>Email</span>
            <input type="email" formControlName="email" autocomplete="email" />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" formControlName="password" autocomplete="current-password" />
          </label>
          <p class="feedback">{{ feedback() }}</p>
          <button class="button button-dark" type="submit" [disabled]="loading()">Entrar</button>
        </form>
        <p class="muted-link">Ainda não tem conta? <a routerLink="/register">Cadastre-se</a></p>
      </section>
    </main>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly feedback = signal('');
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.feedback.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/dashboard'),
      error: ({ error }: { error?: ApiError }) => {
        this.feedback.set(error?.error ?? error?.message ?? 'Não foi possível entrar.');
        this.loading.set(false);
      },
    });
  }
}
