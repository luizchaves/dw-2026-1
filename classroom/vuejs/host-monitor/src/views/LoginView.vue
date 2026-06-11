<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { api } from '@/lib/api'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const route = useRoute()
const session = useSessionStore()
const loading = ref(false)
const feedback = ref('')
const form = reactive({
  email: '',
  password: '',
})

async function submit() {
  feedback.value = ''
  loading.value = true

  try {
    const result = await api.login({ ...form })
    session.setSession(result)
    router.push(String(route.query.redirect ?? '/dashboard'))
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : 'Nao foi possivel entrar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-copy">
      <p class="eyebrow">Acesso</p>
      <h1>Entrar</h1>
      <p>Acesse seu dashboard para consultar hosts, executar checks e acompanhar o historico.</p>
    </section>

    <section class="auth-card">
      <form class="form-grid" @submit.prevent="submit">
        <label>
          <span>Email</span>
          <input v-model.trim="form.email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Senha</span>
          <input v-model="form.password" type="password" autocomplete="current-password" required />
        </label>
        <p class="form-feedback">{{ feedback }}</p>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      <p class="switch-auth">
        Ainda nao tem conta?
        <RouterLink to="/register">Cadastre-se</RouterLink>
      </p>
    </section>
  </main>
</template>
