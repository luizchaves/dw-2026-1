<script setup lang="ts">
import { ArrowLeft, Play, RefreshCcw } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import LatencyChart from '@/components/LatencyChart.vue'
import TimelineChart from '@/components/TimelineChart.vue'
import { api } from '@/lib/api'
import { formatDate, formatPercent, statusLabelClass } from '@/lib/format'
import { useSessionStore } from '@/stores/session'
import type { HostDetails } from '@/types'

const route = useRoute()
const session = useSessionStore()
const details = ref<HostDetails | null>(null)
const loading = ref(true)
const pinging = ref(false)
const error = ref('')
const feedback = ref('')
const count = ref(1)

const hostId = computed(() => String(route.params.id))

async function loadDetails() {
  if (!session.token) return

  loading.value = true
  error.value = ''

  try {
    details.value = await api.readHostDetails(session.token, hostId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Nao foi possivel carregar o host.'
  } finally {
    loading.value = false
  }
}

async function runPing() {
  if (!session.token || !details.value) return

  if (Number.isNaN(Number(count.value)) || count.value < 1) {
    feedback.value = 'Informe uma quantidade de pacotes maior que zero.'
    return
  }

  pinging.value = true
  feedback.value = 'Executando ping...'

  try {
    const result = await api.pingHost(session.token, hostId.value, count.value)
    feedback.value = result.reachable
      ? `Ping realizado com sucesso em ${formatDate(result.checkedAt)}.`
      : `Host indisponivel em ${formatDate(result.checkedAt)}: ${result.error ?? 'sem resposta'}`
    await loadDetails()
  } catch (err) {
    feedback.value = err instanceof Error ? err.message : 'Erro ao executar ping.'
  } finally {
    pinging.value = false
  }
}

onMounted(loadDetails)
</script>

<template>
  <main class="page-shell details-page">
    <RouterLink to="/dashboard" class="back-link">
      <ArrowLeft :size="17" />
      Voltar
    </RouterLink>

    <p v-if="loading" class="empty-state">Carregando detalhes...</p>
    <p v-else-if="error" class="alert">{{ error }}</p>

    <template v-else-if="details">
      <header class="details-header">
        <div>
          <p class="eyebrow">Detalhes do host</p>
          <h1>{{ details.host.name }}</h1>
          <p>{{ details.host.address }} - {{ details.host.category }}</p>
        </div>
        <span :class="statusLabelClass(details.host.status)">{{ details.host.status }}</span>
      </header>

      <section class="summary-grid">
        <article>
          <span>Status atual</span>
          <strong>{{ details.host.status }}</strong>
        </article>
        <article>
          <span>Disponibilidade</span>
          <strong>{{ formatPercent(details.host.uptime) }}</strong>
        </article>
        <article>
          <span>Checks totais</span>
          <strong>{{ details.statistics.totalChecks }}</strong>
        </article>
        <article>
          <span>Ultimo check</span>
          <strong class="small-stat">{{ formatDate(details.statistics.lastCheckAt) }}</strong>
        </article>
      </section>

      <section class="panel ping-panel">
        <div>
          <h2>Verificacao de disponibilidade</h2>
          <p>Execute uma nova verificacao manual para atualizar status e historico.</p>
        </div>
        <div class="ping-controls">
          <label>
            Pacotes
            <input v-model.number="count" type="number" min="1" max="10" />
          </label>
          <button class="primary-button" type="button" :disabled="pinging" @click="runPing">
            <Play :size="17" />
            {{ pinging ? 'Executando...' : 'Verificar' }}
          </button>
          <button class="icon-button" type="button" :disabled="loading" title="Atualizar" @click="loadDetails">
            <RefreshCcw :size="17" />
          </button>
        </div>
        <p class="muted-feedback">{{ feedback }}</p>
      </section>

      <section class="panel">
        <h2>Grafico de latencia</h2>
        <p>Ultimos checks, com barras vermelhas para indisponibilidade.</p>
        <LatencyChart :history="details.history" />
      </section>

      <section class="panel">
        <h2>Timeline de checks</h2>
        <p>Cada barra representa um check recente de ping.</p>
        <TimelineChart :history="details.history" />
      </section>

      <section class="panel">
        <h2>Historico de ping</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Status</th>
                <th>Transm.</th>
                <th>Receb.</th>
                <th>Media (ms)</th>
                <th>Erro</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!details.history.length">
                <td colspan="6">Nenhum ping registrado ainda.</td>
              </tr>
              <tr v-for="entry in details.history" :key="entry.id">
                <td>{{ formatDate(entry.checkedAt) }}</td>
                <td>
                  <span :class="entry.reachable ? 'status status-online' : 'status status-offline'">
                    {{ entry.reachable ? 'Online' : 'Offline' }}
                  </span>
                </td>
                <td>{{ entry.transmitted }}</td>
                <td>{{ entry.received }}</td>
                <td>{{ entry.avgMs === null ? '-' : Number(entry.avgMs).toFixed(3) }}</td>
                <td class="error-cell">{{ entry.error ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </main>
</template>
