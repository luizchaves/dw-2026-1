export type HostStatus = 'Unknown' | 'Online' | 'Offline'

export type User = {
  id: string
  name: string
  email: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type HostInput = {
  name: string
  address: string
  category: string
}

export type HostRecord = HostInput & {
  id: string
  status: HostStatus
  uptime: number
  lastCheckedAt: string | null
}

export type HostAvailabilityStatistics = {
  totalChecks: number
  successfulChecks: number
  failedChecks: number
  availability: number
  averageLatency: number | null
  minLatency: number | null
  maxLatency: number | null
  lastCheckAt: string | null
}

export type PingHistoryItem = {
  id: number
  checkedAt: string
  reachable: boolean
  transmitted: number
  received: number
  minMs: number | null
  avgMs: number | null
  maxMs: number | null
  stddevMs: number | null
  error: string | null
}

export type HostDetails = {
  host: HostRecord
  statistics: HostAvailabilityStatistics
  history: PingHistoryItem[]
}

export type PingResponse = {
  reachable: boolean
  checkedAt: string
  error?: string
  hostStatus: {
    status: HostStatus
    uptime: number
    lastCheckedAt: string | null
  }
}
