import {
  Prisma,
  type Host as PrismaHost,
  type PingCheck,
} from '@/generated/prisma/client.js';
import cuid from 'cuid';

import { prisma } from '@/database/database.js';
import { HostNotFoundError, InvalidHostError } from '@/errors/HostError.js';
import {
  hostCreateSchema,
  hostWithIdSchema,
  type HostCreateInput,
  type HostWithIdInput,
} from '@/schemas/host.js';
import type {
  HostAvailabilityStatistics,
  HostDetails,
  HostRecord,
  HostStatus,
  PingHistoryItem,
  PingResult,
  PingState,
} from '@/types.js';

type AllowedFilterField = 'id' | 'name' | 'address' | 'category' | 'status';
type HostFilter = Partial<Record<AllowedFilterField, string | number>>;

const ALLOWED_FILTER_FIELDS = new Set<AllowedFilterField>([
  'id',
  'name',
  'address',
  'category',
  'status',
]);

function roundAvailability(value: number): number {
  return Number(value.toFixed(2));
}

function roundNullable(value: number | null | undefined, digits: number) {
  return value === null || value === undefined
    ? null
    : Number(Number(value).toFixed(digits));
}

function mapHostRow(row: PrismaHost): HostRecord {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    category: row.category ?? '',
    status: (row.status ?? 'Unknown') as HostStatus,
    uptime: Number(row.uptime ?? 0),
    lastCheckedAt: row.lastCheckedAt ?? null,
  };
}

function mapPrismaNotFound(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    throw new HostNotFoundError('Host not found');
  }

  throw error;
}

function createEmptyPingStatistics(): HostAvailabilityStatistics {
  return {
    totalChecks: 0,
    successfulChecks: 0,
    failedChecks: 0,
    availability: 0,
    averageLatency: null,
    minLatency: null,
    maxLatency: null,
    lastCheckAt: null,
  };
}

async function getPingStatistics(
  hostId: string
): Promise<HostAvailabilityStatistics> {
  const [totalChecks, successfulChecks, latency, lastCheck] = await Promise.all(
    [
      prisma.pingCheck.count({ where: { hostId } }),
      prisma.pingCheck.count({ where: { hostId, reachable: true } }),
      prisma.pingCheck.aggregate({
        where: { hostId },
        _avg: { avgMs: true },
        _min: { minMs: true },
        _max: { maxMs: true },
      }),
      prisma.pingCheck.findFirst({
        where: { hostId },
        orderBy: [{ checkedAt: 'desc' }, { id: 'desc' }],
        select: { checkedAt: true },
      }),
    ]
  );

  if (!totalChecks) {
    return createEmptyPingStatistics();
  }

  const failedChecks = totalChecks - successfulChecks;
  const availability = roundAvailability(
    (successfulChecks / totalChecks) * 100
  );

  return {
    totalChecks,
    successfulChecks,
    failedChecks,
    availability,
    averageLatency: roundNullable(latency._avg.avgMs, 3),
    minLatency: roundNullable(latency._min.minMs, 3),
    maxLatency: roundNullable(latency._max.maxMs, 3),
    lastCheckAt: lastCheck?.checkedAt ?? null,
  };
}

async function updateHostAvailability(
  hostId: string,
  status: HostStatus
): Promise<HostAvailabilityStatistics> {
  const stats = await getPingStatistics(hostId);

  await prisma.host.update({
    where: { id: hostId },
    data: {
      status,
      uptime: stats.availability,
      lastCheckedAt: stats.lastCheckAt,
    },
  });

  return stats;
}

async function create({
  name,
  address,
  category,
  id,
}: HostCreateInput & { id?: string }): Promise<HostRecord> {
  const hostId = id ?? cuid();

  let parsedHost: HostCreateInput;

  try {
    parsedHost = hostCreateSchema.parse({
      name,
      address,
      category,
    });
  } catch {
    throw new InvalidHostError('Error when passing parameters');
  }

  const host = await prisma.host.create({
    data: {
      id: hostId,
      name: parsedHost.name,
      address: parsedHost.address,
      category: parsedHost.category,
      status: 'Unknown',
      uptime: 0,
      lastCheckedAt: null,
    },
  });

  return mapHostRow(host);
}

async function read(where?: HostFilter): Promise<HostRecord[]> {
  if (where) {
    const field = Object.keys(where)[0] as AllowedFilterField | undefined;

    if (!field || !ALLOWED_FILTER_FIELDS.has(field)) {
      throw new InvalidHostError('Invalid filter field');
    }

    const value = where[field];

    if (value === undefined) {
      throw new InvalidHostError('Invalid filter value');
    }

    const rows = await prisma.host.findMany({
      where:
        typeof value === 'string'
          ? ({
              [field]: {
                contains: value,
              },
            } as Prisma.HostWhereInput)
          : ({
              [field]: value,
            } as Prisma.HostWhereInput),
    });

    return rows.map(mapHostRow);
  }

  const rows = await prisma.host.findMany();

  return rows.map(mapHostRow);
}

async function readById(id: string | undefined): Promise<HostRecord> {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  const host = await prisma.host.findUnique({ where: { id } });

  if (!host) {
    throw new HostNotFoundError('Host not found');
  }

  return mapHostRow(host);
}

async function update({
  id,
  name,
  address,
  category,
}: HostWithIdInput): Promise<HostRecord> {
  let parsedHost: HostWithIdInput;

  try {
    parsedHost = hostWithIdSchema.parse({
      id,
      name,
      address,
      category,
    });
  } catch {
    throw new InvalidHostError('Error when passing parameters');
  }

  try {
    const host = await prisma.host.update({
      where: { id: parsedHost.id },
      data: {
        name: parsedHost.name,
        address: parsedHost.address,
        category: parsedHost.category,
      },
    });

    return mapHostRow(host);
  } catch (error) {
    mapPrismaNotFound(error);
  }
}

async function remove(id: string | undefined): Promise<boolean> {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  try {
    await prisma.host.delete({ where: { id } });
  } catch (error) {
    mapPrismaNotFound(error);
  }

  return true;
}

async function addPingResult(
  hostId: string,
  pingResult: PingResult
): Promise<PingState> {
  const checkedAt = new Date().toISOString();

  await prisma.pingCheck.create({
    data: {
      hostId,
      checkedAt,
      reachable: true,
      transmitted: pingResult.statistics.transmitted,
      received: pingResult.statistics.received,
      minMs: pingResult.statistics.min,
      avgMs: pingResult.statistics.avg,
      maxMs: pingResult.statistics.max,
      stddevMs: pingResult.statistics.stddev,
      output: pingResult.output,
      error: null,
    },
  });

  const statistics = await updateHostAvailability(hostId, 'Online');

  return {
    checkedAt,
    reachable: true,
    statistics,
  };
}

async function addPingError(
  hostId: string,
  errorMessage: string
): Promise<PingState> {
  const checkedAt = new Date().toISOString();

  await prisma.pingCheck.create({
    data: {
      hostId,
      checkedAt,
      reachable: false,
      transmitted: 0,
      received: 0,
      minMs: null,
      avgMs: null,
      maxMs: null,
      stddevMs: null,
      output: null,
      error: errorMessage,
    },
  });

  const statistics = await updateHostAvailability(hostId, 'Offline');

  return {
    checkedAt,
    reachable: false,
    statistics,
  };
}

function mapPingHistoryRow(row: PingCheck): PingHistoryItem {
  return {
    id: row.id,
    checkedAt: row.checkedAt,
    reachable: row.reachable,
    transmitted: Number(row.transmitted ?? 0),
    received: Number(row.received ?? 0),
    minMs: row.minMs,
    avgMs: row.avgMs,
    maxMs: row.maxMs,
    stddevMs: row.stddevMs,
    error: row.error,
  };
}

async function readPingHistory(
  hostId: string,
  limit: unknown = 20
): Promise<PingHistoryItem[]> {
  const parsedLimit = Number.isNaN(Number(limit))
    ? 20
    : Math.min(Math.max(Number(limit), 1), 100);

  const historyRows = await prisma.pingCheck.findMany({
    where: { hostId },
    orderBy: [{ checkedAt: 'desc' }, { id: 'desc' }],
    take: parsedLimit,
  });

  return historyRows.map(mapPingHistoryRow);
}

async function readDetails(
  hostId: string,
  limit: unknown = 20
): Promise<HostDetails> {
  const host = await readById(hostId);
  const history = await readPingHistory(hostId, limit);
  const statistics = await getPingStatistics(hostId);

  return {
    host,
    statistics,
    history,
  };
}

export default {
  create,
  read,
  readById,
  update,
  remove,
  addPingResult,
  addPingError,
  readPingHistory,
  readDetails,
};
