import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../../layout/navbar.component';

@Component({
  selector: 'app-home-page',
  imports: [NavbarComponent, RouterLink],
  template: `
    <main class="hero-page">
      <app-navbar theme="dark" />

      <section class="hero-shell">
        <div class="hero-copy">
          <p class="eyebrow cyan">Monitoramento de hosts</p>
          <h1>Host Monitor</h1>
          <p>
            Acompanhe disponibilidade, latência e histórico dos seus hosts em um painel direto para
            operação.
          </p>
          <div class="hero-actions">
            <a class="button button-cyan" routerLink="/login">Entrar</a>
            <a class="button button-ghost-dark" routerLink="/register">Criar conta</a>
          </div>
        </div>

        <div class="terminal-preview" aria-label="Prévia do dashboard">
          <div class="terminal-bar">
            <span class="dot rose"></span>
            <span class="dot amber"></span>
            <span class="dot green"></span>
            <small>dashboard</small>
          </div>
          <div class="metric-grid">
            <article class="metric-card success">
              <span>Online</span>
              <strong>98.5%</strong>
              <div class="meter"><i style="width: 98%"></i></div>
            </article>
            <article class="metric-card info">
              <span>Latência</span>
              <strong>12ms</strong>
              <div class="mini-bars">
                <i style="height: 36%"></i>
                <i style="height: 70%"></i>
                <i style="height: 48%"></i>
                <i style="height: 90%"></i>
                <i style="height: 58%"></i>
              </div>
            </article>
            <article class="metric-card danger">
              <span>Alertas</span>
              <strong>1</strong>
              <div class="meter"><i style="width: 20%"></i></div>
            </article>
          </div>
          <div class="preview-list">
            <div>
              <span><b>Google DNS</b><small>8.8.8.8</small></span>
              <em class="pill online">Online</em>
            </div>
            <div>
              <span><b>Servidor interno</b><small>intranet.local</small></span>
              <em class="pill offline">Offline</em>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class HomePage {}
