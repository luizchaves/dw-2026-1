import type { AuthResponse, HostDetails, HostInput, HostRecord, PingResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type RequestOptions = RequestInit & {
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? 'Falha na requisicao.')
  }

  return payload as T
}

export const api = {
  login(payload: { email: string; password: string }) {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  register(payload: { name: string; email: string; password: string; passwordConfirmation: string }) {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listHosts(token: string) {
    return request<HostRecord[]>('/api/hosts', { token })
  },
  createHost(token: string, payload: HostInput) {
    return request<HostRecord>('/api/hosts', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    })
  },
  deleteHost(token: string, id: string) {
    return request<void>(`/api/hosts/${id}`, {
      method: 'DELETE',
      token,
    })
  },
  readHostDetails(token: string, id: string, limit = 30) {
    return request<HostDetails>(`/api/hosts/${id}/details?limit=${limit}`, { token })
  },
  pingHost(token: string, id: string, count: number) {
    return request<PingResponse>(`/api/hosts/${id}/ping?count=${count}`, { token })
  },
}
