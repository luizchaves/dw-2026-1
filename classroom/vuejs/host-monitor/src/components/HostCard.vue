<script setup lang="ts">
import { ExternalLink, Trash2 } from '@lucide/vue'
import { computed } from 'vue'

import { formatDate, formatPercent, statusLabelClass } from '@/lib/format'
import type { HostRecord } from '@/types'

const props = defineProps<{
  host: HostRecord
  deleting?: boolean
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const uptime = computed(() => Math.max(0, Math.min(100, props.host.uptime ?? 0)))
const barClass = computed(() => {
  if (uptime.value >= 95) return 'bar-good'
  if (uptime.value >= 80) return 'bar-warn'
  if (uptime.value > 0) return 'bar-bad'
  return 'bar-empty'
})
</script>

<template>
  <article class="host-card">
    <div class="host-card-header">
      <div>
        <h2>{{ host.name }}</h2>
        <p>Categoria: {{ host.category }}</p>
      </div>
      <span :class="statusLabelClass(host.status)">{{ host.status }}</span>
    </div>

    <dl class="host-facts">
      <div>
        <dt>Endereco</dt>
        <dd>{{ host.address }}</dd>
      </div>
      <div>
        <dt>Uptime</dt>
        <dd>{{ formatPercent(host.uptime) }}</dd>
        <span class="progress">
          <span :class="['progress-fill', barClass]" :style="{ width: `${uptime}%` }" />
        </span>
      </div>
      <div>
        <dt>Ultimo check</dt>
        <dd>{{ formatDate(host.lastCheckedAt) }}</dd>
      </div>
    </dl>

    <footer class="host-card-actions">
      <span>ID: {{ host.id.slice(0, 10) }}...</span>
      <div>
        <RouterLink :to="`/hosts/${host.id}`" class="icon-text-button">
          <ExternalLink :size="16" />
          Detalhes
        </RouterLink>
        <button
          class="icon-button danger"
          type="button"
          :disabled="deleting"
          title="Remover host"
          @click="emit('delete', host.id)"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </footer>
  </article>
</template>
