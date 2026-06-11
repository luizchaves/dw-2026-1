<script setup lang="ts">
import { X } from '@lucide/vue'
import { reactive } from 'vue'

import type { HostInput } from '@/types'

defineProps<{
  open: boolean
  saving?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: HostInput]
}>()

const form = reactive<HostInput>({
  name: '',
  address: '',
  category: '',
})

function submit() {
  emit('submit', { ...form })
}

function reset() {
  form.name = ''
  form.address = ''
  form.category = ''
}

defineExpose({ reset })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" role="presentation" @click.self="emit('close')">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="host-modal-title">
        <header class="modal-header">
          <div>
            <h2 id="host-modal-title">Adicionar host</h2>
            <p>Cadastre um IP ou dominio para iniciar o monitoramento.</p>
          </div>
          <button class="icon-button" type="button" title="Fechar" @click="emit('close')">
            <X :size="18" />
          </button>
        </header>

        <form class="form-grid" @submit.prevent="submit">
          <label>
            <span>Nome do host</span>
            <input v-model.trim="form.name" required placeholder="Google DNS" />
          </label>
          <label>
            <span>Endereco</span>
            <input v-model.trim="form.address" required placeholder="8.8.8.8" />
          </label>
          <label>
            <span>Categoria</span>
            <input v-model.trim="form.category" required placeholder="DNS" />
          </label>
          <p class="form-feedback">{{ error }}</p>
          <button class="primary-button" type="submit" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Adicionar host' }}
          </button>
        </form>
      </section>
    </div>
  </Teleport>
</template>
