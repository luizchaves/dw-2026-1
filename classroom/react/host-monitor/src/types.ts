export type User = {
  id: string;
  name: string;
  email: string;
};

export type Session = {
  token: string;
  user: User;
};

export type HostStatus = 'Unknown' | 'Online' | 'Manutencao' | 'Manutenção' | 'Offline' | string;

export type Host = {
  id: string;
  name: string;
  address: string;
  category: string;
  status: HostStatus;
  uptime: number | string | null;
};

export type PingHistoryEntry = {
  id?: string;
  checkedAt: string;
  reachable: boolean;
  transmitted: number;
  received: number;
  avgMs: number | null;
  error: string | null;
};

export type HostDetails = {
  host: Host;
  statistics: {
    totalChecks?: number;
    lastCheckAt?: string | null;
  };
  history: PingHistoryEntry[];
};

export type PingResult = {
  reachable: boolean;
  checkedAt: string;
  error?: string;
};
