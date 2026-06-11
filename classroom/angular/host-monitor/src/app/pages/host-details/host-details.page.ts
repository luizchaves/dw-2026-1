import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { HostApiService } from '../../core/host-api.service';
import { HostDetails, PingHistoryEntry } from '../../core/models';
import { NavbarComponent } from '../../layout/navbar.component';

@Component({
  selector: 'app-host-details-page',
  imports: [DatePipe, DecimalPipe, FormsModule, NavbarComponent],
  template: `
    <app-navbar context="details" />
    <main class="details-shell">
      @if (loading()) {
        <p class="empty-state">Carregando detalhes do host...</p>
      } @else if (details(); as payload) {
        <header class="panel hero-panel">
          <p class="eyebrow">Detalhes do host</p>
          <h1>{{ payload.host.name }}</h1>
          <p>{{ payload.host.address }} • {{ payload.host.category }}</p>
        </header>

        <section class="stats-grid">
          <article class="panel stat">
            <span>Status atual</span>
            <strong>{{ payload.host.status }}</strong>
          </article>
          <article class="panel stat">
            <span>Disponibilidade</span>
            <strong>{{ payload.host.uptime | number: '1.2-2' }}%</strong>
          </article>
          <article class="panel stat">
            <span>Checks totais</span>
            <strong>{{ payload.statistics.totalChecks }}</strong>
          </article>
          <article class="panel stat">
            <span>Último check</span>
            <strong class="date-stat">
              {{ payload.statistics.lastCheckAt | date: 'short' : undefined : 'pt-BR' }}
            </strong>
          </article>
        </section>

        <section class="panel">
          <h2>Verificação de disponibilidade</h2>
          <p class="panel-copy">
            Execute uma nova verificação manual de ping para atualizar status, disponibilidade e
            histórico.
          </p>
          <div class="ping-row">
            <label for="ping-count">Pacotes</label>
            <input id="ping-count" type="number" min="1" max="10" [(ngModel)]="pingCount" />
            <button
              class="button button-dark"
              type="button"
              [disabled]="pinging()"
              (click)="runPing()"
            >
              Verificar disponibilidade
            </button>
          </div>
          <p class="notice inline-notice">{{ feedback() }}</p>
        </section>

        <section class="panel">
          <h2>Latência recente</h2>
          <p class="panel-copy">
            Últimos checks com latência média em ms. Barras vermelhas representam host offline.
          </p>
          <div class="latency-chart">
            @if (!chartEntries().length) {
              <span>Sem dados para exibir</span>
            } @else {
              @for (entry of chartEntries(); track entry.checkedAt) {
                <i
                  [class.offline]="!entry.reachable"
                  [style.height.%]="latencyHeight(entry)"
                  [title]="chartTitle(entry)"
                ></i>
              }
            }
          </div>
        </section>

        <section class="panel">
          <h2>Timeline de checks de ping</h2>
          <p class="panel-copy">
            Cada barra representa um check de ping. Verde indica sucesso e vermelho indica
            indisponibilidade.
          </p>
          <div class="timeline">
            @if (!chartEntries().length) {
              <span>Sem checks para exibir</span>
            } @else {
              @for (entry of chartEntries(); track entry.checkedAt) {
                <i [class.offline]="!entry.reachable" [title]="chartTitle(entry)"></i>
              }
            }
          </div>
          <div class="timeline-labels">
            <span>Mais antigo</span>
            <span>Mais recente</span>
          </div>
        </section>

        <section class="panel">
          <h2>Histórico de ping</h2>
          <p class="panel-copy">Últimas verificações de disponibilidade do host.</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Transm.</th>
                  <th>Receb.</th>
                  <th>Média (ms)</th>
                  <th>Erro</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of payload.history; track entry.checkedAt) {
                  <tr>
                    <td>{{ entry.checkedAt | date: 'short' : undefined : 'pt-BR' }}</td>
                    <td>
                      <span
                        class="status-pill"
                        [class.online]="entry.reachable"
                        [class.offline]="!entry.reachable"
                      >
                        {{ entry.reachable ? 'Online' : 'Offline' }}
                      </span>
                    </td>
                    <td>{{ entry.transmitted }}</td>
                    <td>{{ entry.received }}</td>
                    <td>{{ entry.avgMs === null ? '-' : (entry.avgMs | number: '1.3-3') }}</td>
                    <td class="error-cell">{{ entry.error ?? '-' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-row">Nenhum ping registrado ainda.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      } @else {
        <p class="empty-state">Host não encontrado.</p>
      }
    </main>
  `,
})
export class HostDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(HostApiService);

  readonly details = signal<HostDetails | null>(null);
  readonly loading = signal(true);
  readonly pinging = signal(false);
  readonly feedback = signal('');
  readonly chartEntries = computed(() => [...(this.details()?.history ?? [])].reverse().slice(-40));
  readonly maxLatency = computed(() =>
    Math.max(...this.chartEntries().map((entry) => Number(entry.avgMs ?? 0)), 1),
  );

  pingCount = 1;

  private readonly hostId = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    this.loadDetails();
  }

  loadDetails(): void {
    if (!this.hostId) {
      this.loading.set(false);
      this.feedback.set('O parâmetro id é obrigatório.');
      return;
    }

    this.loading.set(true);
    this.api
      .readDetails(this.hostId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (details) => this.details.set(details),
        error: () => this.feedback.set('Não foi possível carregar os detalhes do host.'),
      });
  }

  runPing(): void {
    const count = Number(this.pingCount);

    if (Number.isNaN(count) || count < 1) {
      this.feedback.set('Informe um valor de count válido maior que 0.');
      return;
    }

    this.pinging.set(true);
    this.feedback.set('Executando ping...');
    this.api
      .pingHost(this.hostId, count)
      .pipe(finalize(() => this.pinging.set(false)))
      .subscribe({
        next: (result) => {
          this.feedback.set(
            result.reachable
              ? `Ping realizado com sucesso em ${this.formatDate(result.checkedAt)}.`
              : `Host indisponível em ${this.formatDate(result.checkedAt)}: ${result.error}`,
          );
          this.loadDetails();
        },
        error: () => this.feedback.set('Erro ao executar ping.'),
      });
  }

  latencyHeight(entry: PingHistoryEntry): number {
    const latency = Number(entry.avgMs ?? 0);

    if (!entry.reachable) {
      return 12;
    }

    return Math.max(8, (latency / this.maxLatency()) * 100);
  }

  chartTitle(entry: PingHistoryEntry): string {
    const status = entry.reachable ? 'Online' : 'Offline';
    const latency = entry.avgMs === null ? '-' : `${Number(entry.avgMs).toFixed(3)}ms`;

    return `${this.formatDate(entry.checkedAt)} • ${status} • ${latency}`;
  }

  private formatDate(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
  }
}
