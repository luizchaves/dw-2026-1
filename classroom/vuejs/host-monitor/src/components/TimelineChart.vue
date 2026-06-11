<script setup lang="ts">
import { computed } from 'vue'

import { formatDate } from '@/lib/format'
import type { PingHistoryItem } from '@/types'

const props = defineProps<{
  history: PingHistoryItem[]
}>()

const entries = computed(() => props.history.slice().reverse())
</script>

<template>
  <svg class="chart chart-small" viewBox="0 0 800 120" role="img" aria-label="Timeline de checks">
    <text v-if="!entries.length" x="400" y="60" text-anchor="middle" fill="#64748b" font-size="14">
      Sem checks para exibir
    </text>
    <template v-else>
      <rect
        v-for="(entry, index) in entries"
        :key="entry.id"
        :x="20 + index * 13"
        y="16"
        width="10"
        height="88"
        rx="2"
        :fill="entry.reachable ? '#10b981' : '#f43f5e'"
      >
        <title>
          {{ formatDate(entry.checkedAt) }} - {{ entry.reachable ? 'Online' : 'Offline' }}
          {{ entry.error ? ` - ${entry.error}` : '' }}
        </title>
      </rect>
      <text x="20" y="114" fill="#334155" font-size="13" font-weight="600">Mais antigo</text>
      <text x="780" y="114" text-anchor="end" fill="#334155" font-size="13" font-weight="600">
        Mais recente
      </text>
    </template>
  </svg>
</template>
