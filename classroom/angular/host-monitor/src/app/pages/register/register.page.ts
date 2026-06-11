import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ApiError } from '../../core/models';
import { NavbarComponent } from '../../layout/navbar.component';

@Component({
  selector: 'app-register-page',
  imports: [NavbarComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-navbar />
    <main class="auth-layout">
      <section>
        <h1>Cadastro</h1>
        <p>Crie sua conta para acessar o dashboard de monitoramento e gerenciar hosts.</p>
      </section>

      <section class="panel">
        <form class="form-grid" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>Nome</span>
            <input type="text" formControlName="name" autocomplete="name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" formControlName="email" autocomplete="email" />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" formControlName="password" autocomplete="new-password" />
          </label>
          <label>
            <span>Confirmação de senha</span>
            <input
              type="password"
              formControlName="passwordConfirmation"
              autocomplete="new-password"
            />
          </label>
          <p class="feedback">{{ feedback() }}</p>
          <button class="button button-dark" type="submit" [disabled]="loading()">
            Criar conta
          </button>
        </form>
        <p class="muted-link">Já tem conta? <a routerLink="/login">Entrar</a></p>
      </section>
    </main>
  `,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly feedback = signal('');
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmation: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (value.password !== value.passwordConfirmation) {
      this.feedback.set('A confirmação de senha não confere.');
      return;
    }

    this.loading.set(true);
    this.feedback.set('');
    this.auth.register(value).subscribe({
      next: () => void this.router.navigateByUrl('/dashboard'),
      error: ({ error }: { error?: ApiError }) => {
        this.feedback.set(error?.error ?? error?.message ?? 'Não foi possível cadastrar.');
        this.loading.set(false);
      },
    });
  }
}
