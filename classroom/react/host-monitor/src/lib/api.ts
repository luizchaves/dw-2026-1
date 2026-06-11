import { getToken } from './session';
import type { Host, HostDetails, PingResult, Session } from '../types';

type RequestOptions = RequestInit & {
  authenticated?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = false, headers, ...init } = options;
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(authenticated ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
  });

  const body = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String(body.error)
        : 'Nao foi possivel completar a requisicao.';
    throw new Error(message);
  }

  return body as T;
}

export function login(payload: { email: string; password: string }) {
  return request<Session>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload: {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  return request<Session>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listHosts() {
  return request<Host[]>('/api/hosts', { authenticated: true });
}

export function createHost(payload: Pick<Host, 'name' | 'address' | 'category'>) {
  return request<Host>('/api/hosts', {
    authenticated: true,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteHost(id: string) {
  await request<null>(`/api/hosts/${id}`, {
    authenticated: true,
    method: 'DELETE',
  });
}

export function getHostDetails(id: string) {
  return request<HostDetails>(`/api/hosts/${id}/details?limit=30`, {
    authenticated: true,
  });
}

export function pingHost(id: string, count: number) {
  return request<PingResult>(`/api/hosts/${id}/ping?count=${count}`, {
    authenticated: true,
  });
}
