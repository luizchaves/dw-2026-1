<script setup lang="ts">
import { Plus, RefreshCcw } from '@lucide/vue'
import { computed, onMounted, ref, useTemplateRef } from 'vue'

import HostCard from '@/components/HostCard.vue'
import HostFormModal from '@/components/HostFormModal.vue'
import { api } from '@/lib/api'
import { useSessionStore } from '@/stores/session'
import type { HostInput, HostRecord } from '@/types'

const session = useSessionStore()
const hosts = ref<HostRecord[]>([])
const loading = ref(true)
const modalOpen = ref(false)
const saving = ref(false)
const error = ref('')
const modalError = ref('')
const deletingId = ref('')
const hostModal = useTemplateRef('hostModal')

const onlineCount = computed(() => hosts.value.filter((host) => host.status === 'Online').length)
const offlineCount = computed(() => hosts.value.filter((host) => host.status === 'Offline').length)
const averageUptime = computed(() => {
  if (!hosts.value.length) return '0.00%'
  const total = hosts.value.reduce((sum, host) => sum + Number(host.uptime ?? 0), 0)
  return `${(total / hosts.value.length).toFixed(2)}%`
})

async function loadHosts() {
  if (!session.token) return

  loading.value = true
  error.value = ''

  try {
    hosts.value = await api.listHosts(session.token)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Nao foi possivel carregar os hosts.'
  } finally {
    loading.value = false
  }
}

async function createHost(payload: HostInput) {
  if (!session.token) return

  saving.value = true
  modalError.value = ''

  try {
    hosts.value = [await api.createHost(session.token, payload), ...hosts.value]
    hostModal.value?.reset()
    modalOpen.value = false
  } catch (err) {
    modalError.value = err instanceof Error ? err.message : 'Nao foi possivel adicionar o host.'
  } finally {
    saving.value = false
  }
}

async function deleteHost(id: string) {
  if (!session.token) return

  deletingId.value = id
  error.value = ''

  try {
    await api.deleteHost(session.token, id)
    hosts.value = hosts.value.filter((host) => host.id !== id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Nao foi possivel remover o host.'
  } finally {
    deletingId.value = ''
  }
}

onMounted(loadHosts)
</script>

<template>
  <main class="page-shell">
    <header class="page-header">
      <div>
        <p class="eyebrow">Painel de hosts</p>
        <h1>Hosts disponiveis</h1>
        <p>Visualize disponibilidade, status e historico dos hosts monitorados.</p>
      </div>
      <div class="header-actions">
        <button class="icon-text-button" type="button" :disabled="loading" @click="loadHosts">
          <RefreshCcw :size="17" />
          Atualizar
        </button>
        <button class="primary-button" type="button" @click="modalOpen = true">
          <Plus :size="17" />
          Novo host
        </button>
      </div>
    </header>

    <section class="summary-grid">
      <article>
        <span>Hosts</span>
        <strong>{{ hosts.length }}</strong>
      </article>
      <article>
        <span>Online</span>
        <strong>{{ onlineCount }}</strong>
      </article>
      <article>
        <span>Offline</span>
        <strong>{{ offlineCount }}</strong>
      </article>
      <article>
        <span>Uptime medio</span>
        <strong>{{ averageUptime }}</strong>
      </article>
    </section>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="loading" class="empty-state">Carregando hosts...</p>
    <p v-else-if="!hosts.length" class="empty-state">Nenhum host cadastrado ainda.</p>

    <section v-else class="host-grid">
      <HostCard
        v-for="host in hosts"
        :key="host.id"
        :host="host"
        :deleting="deletingId === host.id"
        @delete="deleteHost"
      />
    </section>

    <HostFormModal
      ref="hostModal"
      :open="modalOpen"
      :saving="saving"
      :error="modalError"
      @close="modalOpen = false"
      @submit="createHost"
    />
  </main>
</template>
