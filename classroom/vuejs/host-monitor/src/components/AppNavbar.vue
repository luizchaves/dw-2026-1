<script setup lang="ts">
import { Activity, BookOpen, LayoutDashboard, LogOut } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const isDark = computed(() => route.meta.theme === 'dark')

function logout() {
  session.clearSession()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav :class="['navbar', { 'navbar-dark': isDark }]">
    <RouterLink :to="session.isAuthenticated ? '/dashboard' : '/'" class="brand">
      <Activity :size="18" />
      <span>Host Monitor</span>
    </RouterLink>

    <div v-if="session.isAuthenticated" class="nav-actions">
      <RouterLink to="/dashboard" class="nav-link">
        <LayoutDashboard :size="17" />
        Dashboard
      </RouterLink>
      <a href="/api/docs" target="_blank" rel="noreferrer" class="nav-link">
        <BookOpen :size="17" />
        API Docs
      </a>
      <span v-if="session.user?.name" class="user-name">{{ session.user.name }}</span>
      <button class="icon-text-button subtle" type="button" @click="logout">
        <LogOut :size="17" />
        Sair
      </button>
    </div>

    <div v-else class="nav-actions">
      <RouterLink to="/login" class="nav-link">Login</RouterLink>
      <RouterLink to="/register" class="nav-link primary-link">Cadastro</RouterLink>
    </div>
  </nav>
</template>
