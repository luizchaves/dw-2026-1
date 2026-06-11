export type HostStatus = 'Unknown' | 'Online' | 'Offline';

export interface User {
  id?: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  passwordConfirmation: string;
}

export interface HostPayload {
  name: string;
  address: string;
  category: string;
}

export interface Host extends HostPayload {
  id: string;
  status: HostStatus;
  uptime: number;
  lastCheckedAt: string | null;
}

export interface PingHistoryEntry {
  id?: string;
  checkedAt: string;
  reachable: boolean;
  transmitted: number;
  received: number;
  avgMs: number | null;
  error: string | null;
}

export interface HostStatistics {
  availability: number;
  totalChecks: number;
  lastCheckAt: string | null;
}

export interface HostDetails {
  host: Host;
  statistics: HostStatistics;
  history: PingHistoryEntry[];
}

export interface PingResult {
  reachable: boolean;
  checkedAt: string;
  error?: string;
  hostStatus: {
    status: HostStatus;
    uptime: number;
    lastCheckedAt: string | null;
  };
}

export interface ApiError {
  error?: string;
  message?: string;
}
