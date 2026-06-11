<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { api } from '@/lib/api'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()
const loading = ref(false)
const feedback = ref('')
const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})

async function submit() {
  feedback.value = ''
  loading.value = true

  try {
    const result = await api.register({ ...form })
    session.setSession(result)
    router.push('/dashboard')
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : 'Nao foi possivel cadastrar.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-copy">
      <p class="eyebrow">Nova conta</p>
      <h1>Cadastro</h1>
      <p>Crie sua conta para acessar o dashboard de monitoramento e gerenciar hosts.</p>
    </section>

    <section class="auth-card">
      <form class="form-grid" @submit.prevent="submit">
        <label>
          <span>Nome</span>
          <input v-model.trim="form.name" autocomplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input v-model.trim="form.email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Senha</span>
          <input v-model="form.password" type="password" autocomplete="new-password" minlength="6" required />
        </label>
        <label>
          <span>Confirmacao de senha</span>
          <input
            v-model="form.passwordConfirmation"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
          />
        </label>
        <p class="form-feedback">{{ feedback }}</p>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Criando...' : 'Criar conta' }}
        </button>
      </form>
      <p class="switch-auth">
        Ja tem conta?
        <RouterLink to="/login">Entrar</RouterLink>
      </p>
    </section>
  </main>
</template>
