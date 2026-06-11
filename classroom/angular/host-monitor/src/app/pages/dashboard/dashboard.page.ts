import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiError, Host } from '../../core/models';
import { HostApiService } from '../../core/host-api.service';
import { NavbarComponent } from '../../layout/navbar.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DecimalPipe, NavbarComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-navbar context="dashboard" />
    <main class="page-shell">
      <header class="page-header">
        <p class="eyebrow">Painel de Hosts</p>
        <h1>Hosts disponíveis</h1>
        <p>Visualize informações básicas dos hosts monitorados.</p>
      </header>

      <section class="toolbar">
        <button class="button button-dark" type="button" (click)="openModal()">
          Adicionar novo host
        </button>
      </section>

      @if (feedback()) {
        <p class="notice">{{ feedback() }}</p>
      }

      @if (loading()) {
        <p class="empty-state">Carregando hosts...</p>
      } @else if (!hosts().length) {
        <p class="empty-state">Nenhum host cadastrado ainda.</p>
      } @else {
        <section class="host-grid">
          @for (host of sortedHosts(); track host.id) {
            <article class="host-card">
              <div class="card-heading">
                <div>
                  <h2>{{ host.name }}</h2>
                  <p>Categoria: {{ host.category }}</p>
                </div>
                <span
                  class="status-pill"
                  [class.online]="host.status === 'Online'"
                  [class.offline]="host.status === 'Offline'"
                  [class.unknown]="host.status === 'Unknown'"
                >
                  {{ host.status }}
                </span>
              </div>

              <dl class="host-facts">
                <div>
                  <dt>Endereço</dt>
                  <dd>{{ host.address }}</dd>
                </div>
                <div>
                  <dt>Uptime</dt>
                  <dd>{{ host.uptime | number: '1.2-2' }}%</dd>
                  <div class="meter">
                    <i
                      [class]="availabilityClass(host.uptime)"
                      [style.width.%]="clamp(host.uptime)"
                    ></i>
                  </div>
                </div>
              </dl>

              <footer class="card-actions">
                <span>ID: {{ host.id.slice(0, 10) }}...</span>
                <div>
                  <a class="button button-small button-dark" [routerLink]="['/hosts', host.id]">
                    Ver detalhes
                  </a>
                  <button
                    class="button button-small button-danger"
                    type="button"
                    (click)="deleteHost(host.id)"
                  >
                    Remover
                  </button>
                </div>
              </footer>
            </article>
          }
        </section>
      }
    </main>

    @if (modalOpen()) {
      <div class="modal-backdrop" role="dialog" aria-modal="true" (click)="closeModal()">
        <section class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-heading">
            <div>
              <h2>Adicionar novo host</h2>
              <p>Preencha os dados para cadastrar um host no painel.</p>
            </div>
            <button class="button button-ghost" type="button" (click)="closeModal()">Fechar</button>
          </div>

          <form class="form-grid" [formGroup]="form" (ngSubmit)="createHost()">
            <label>
              <span>Nome do host</span>
              <input type="text" formControlName="name" placeholder="Google DNS" />
            </label>
            <label>
              <span>Endereço (IP ou domínio)</span>
              <input type="text" formControlName="address" placeholder="8.8.8.8" />
            </label>
            <label>
              <span>Categoria</span>
              <input type="text" formControlName="category" placeholder="DNS" />
            </label>
            <p class="feedback">{{ modalFeedback() }}</p>
            <button class="button button-dark" type="submit" [disabled]="saving()">
              Adicionar host
            </button>
          </form>
        </section>
      </div>
    }
  `,
})
export class DashboardPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(HostApiService);

  readonly hosts = signal<Host[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly modalOpen = signal(false);
  readonly feedback = signal('');
  readonly modalFeedback = signal('');
  readonly sortedHosts = computed(() => [...this.hosts()].reverse());
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    category: ['', Validators.required],
  });

  constructor() {
    this.loadHosts();
  }

  loadHosts(): void {
    this.loading.set(true);
    this.api
      .listHosts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (hosts) => this.hosts.set(hosts),
        error: () => this.feedback.set('Não foi possível buscar os hosts.'),
      });
  }

  openModal(): void {
    this.modalFeedback.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  createHost(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.modalFeedback.set('');
    this.api
      .createHost(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (host) => {
          this.hosts.update((hosts) => [...hosts, host]);
          this.form.reset();
          this.closeModal();
        },
        error: ({ error }: { error?: ApiError }) => {
          this.modalFeedback.set(error?.error ?? error?.message ?? 'Erro ao adicionar host.');
        },
      });
  }

  deleteHost(id: string): void {
    this.api.deleteHost(id).subscribe({
      next: () => this.hosts.update((hosts) => hosts.filter((host) => host.id !== id)),
      error: () => this.feedback.set('Erro ao excluir host.'),
    });
  }

  clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  availabilityClass(value: number): string {
    if (value >= 95) {
      return 'bar-good';
    }

    if (value >= 80) {
      return 'bar-warn';
    }

    return value > 0 ? 'bar-bad' : 'bar-empty';
  }
}
