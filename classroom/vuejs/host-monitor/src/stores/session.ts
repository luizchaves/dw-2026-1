import { defineStore } from 'pinia'

import type { AuthResponse, User } from '@/types'

const TOKEN_KEY = 'hostMonitorToken'
const USER_KEY = 'hostMonitorUser'

function readUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY),
    user: readUser(),
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setSession(session: AuthResponse) {
      this.token = session.token
      this.user = session.user
      localStorage.setItem(TOKEN_KEY, session.token)
      localStorage.setItem(USER_KEY, JSON.stringify(session.user))
    },
    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})
