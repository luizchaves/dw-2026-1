import { createRouter, createWebHistory } from 'vue-router'

import { useSessionStore } from '@/stores/session'
import DashboardView from '@/views/DashboardView.vue'
import HostDetailsView from '@/views/HostDetailsView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { publicOnly: true, theme: 'dark' } },
    { path: '/login', name: 'login', component: LoginView, meta: { publicOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { publicOnly: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/hosts/:id', name: 'host-details', component: HostDetailsView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const session = useSessionStore()

  if (to.meta.requiresAuth && !session.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.publicOnly && session.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
