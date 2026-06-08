export type HostStatus = 'Unknown' | 'Online' | 'Offline';

export type HostInput = {
  name: string;
  address: string;
  category: string;
};

export type HostRecord = HostInput & {
  id: string;
  status: HostStatus;
  uptime: number;
  lastCheckedAt: string | null;
};

export type PingPacket = {
  seq: number;
  ttl: number;
  time: number;
};

export type PingStatistics = {
  transmitted: number;
  received: number;
  losted: number;
  min: number;
  avg: number;
  max: number;
  stddev: number;
};

export type PingResult = {
  host: string;
  ip: string;
  packets: PingPacket[];
  statistics: PingStatistics;
  output: string;
};

export type HostAvailabilityStatistics = {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  availability: number;
  averageLatency: number | null;
  minLatency: number | null;
  maxLatency: number | null;
  lastCheckAt: string | null;
};

export type PingState = {
  checkedAt: string;
  reachable: boolean;
  statistics: HostAvailabilityStatistics;
};

export type PingHistoryItem = {
  id: number;
  checkedAt: string;
  reachable: boolean;
  transmitted: number;
  received: number;
  minMs: number | null;
  avgMs: number | null;
  maxMs: number | null;
  stddevMs: number | null;
  error: string | null;
};

export type HostDetails = {
  host: HostRecord;
  statistics: HostAvailabilityStatistics;
  history: PingHistoryItem[];
};
