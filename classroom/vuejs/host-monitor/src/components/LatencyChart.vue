<script setup lang="ts">
import { computed } from 'vue'

import { formatDate } from '@/lib/format'
import type { PingHistoryItem } from '@/types'

const props = defineProps<{
  history: PingHistoryItem[]
}>()

const width = 800
const height = 260
const padding = 28

const bars = computed(() => {
  const plotted = props.history
    .slice()
    .reverse()
    .map((entry) => ({ ...entry, latency: entry.avgMs === null ? 0 : Number(entry.avgMs) }))
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const maxLatency = Math.max(...plotted.map((entry) => entry.latency), 1)
  const slotWidth = chartWidth / Math.max(plotted.length, 1)
  const barWidth = Math.max(Math.min(slotWidth * 0.6, 32), 8)

  return plotted.map((entry, index) => {
    const barHeight = Math.max((entry.latency / maxLatency) * chartHeight, 4)
    return {
      ...entry,
      width: barWidth,
      height: barHeight,
      x: padding + index * slotWidth + (slotWidth - barWidth) / 2,
      y: height - padding - barHeight,
      maxLatency,
    }
  })
})

const maxLatencyLabel = computed(() => `${(bars.value[0]?.maxLatency ?? 1).toFixed(2)} ms`)
</script>

<template>
  <svg class="chart chart-large" viewBox="0 0 800 260" role="img" aria-label="Grafico de latencia">
    <line x1="28" y1="28" x2="28" y2="232" stroke="#94a3b8" />
    <line x1="28" y1="232" x2="772" y2="232" stroke="#94a3b8" />
    <text v-if="!bars.length" x="400" y="130" text-anchor="middle" fill="#64748b" font-size="16">
      Sem dados para exibir
    </text>
    <template v-else>
      <rect
        v-for="bar in bars"
        :key="bar.id"
        :x="bar.x"
        :y="bar.y"
        :width="bar.width"
        :height="bar.height"
        rx="3"
        :fill="bar.reachable ? '#059669' : '#dc2626'"
      >
        <title>
          {{ formatDate(bar.checkedAt) }} - {{ bar.reachable ? 'Online' : 'Offline' }} -
          {{ bar.latency.toFixed(3) }}ms
        </title>
      </rect>
      <text x="28" y="18" fill="#475569" font-size="12">{{ maxLatencyLabel }}</text>
      <text x="772" y="252" text-anchor="end" fill="#475569" font-size="12">Checks recentes</text>
    </template>
  </svg>
</template>
