<script setup lang="ts">
import { Activity, Gauge, RadioTower } from '@lucide/vue'
</script>

<template>
  <main class="home-page">
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">Monitoramento de hosts</p>
        <h1>Host Monitor</h1>
        <p>
          Acompanhe disponibilidade, latencia e historico dos seus hosts em um painel direto para
          operacao.
        </p>
        <div class="hero-actions">
          <RouterLink to="/login" class="primary-button">Entrar</RouterLink>
          <RouterLink to="/register" class="secondary-button">Criar conta</RouterLink>
        </div>
      </div>

      <div class="terminal-preview" aria-label="Previa do dashboard">
        <div class="window-bar">
          <span />
          <span />
          <span />
          <strong>dashboard.vue</strong>
        </div>
        <div class="preview-grid">
          <article>
            <Activity :size="20" />
            <span>Online</span>
            <strong>98.5%</strong>
            <i class="meter meter-good" />
          </article>
          <article>
            <Gauge :size="20" />
            <span>Latencia</span>
            <strong>12ms</strong>
            <div class="bars">
              <i style="height: 38%" />
              <i style="height: 72%" />
              <i style="height: 48%" />
              <i style="height: 90%" />
              <i style="height: 62%" />
            </div>
          </article>
          <article>
            <RadioTower :size="20" />
            <span>Alertas</span>
            <strong>1</strong>
            <i class="meter meter-bad" />
          </article>
        </div>
        <div class="preview-list">
          <div>
            <span>
              <strong>Google DNS</strong>
              <small>8.8.8.8</small>
            </span>
            <em class="online">Online</em>
          </div>
          <div>
            <span>
              <strong>Servidor interno</strong>
              <small>intranet.local</small>
            </span>
            <em class="offline">Offline</em>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
