import cuid from 'cuid';
import type { DatabaseRow, PromiseDatabase } from '@/database/database.js';
import database from '@/database/database.js';
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

type HostRow = DatabaseRow & {
  id: string;
  name: string;
  address: string;
  category: string;
  status: HostStatus | null;
  uptime: number | null;
  last_checked_at: string | null;
};

type PingAggregateRow = DatabaseRow & {
  total_checks: number;
  successful_checks: number;
  average_latency: number | null;
  min_latency: number | null;
  max_latency: number | null;
  last_check_at: string | null;
};

type PingHistoryRow = DatabaseRow & {
  id: number;
  checked_at: string;
  reachable: number;
  transmitted: number | null;
  received: number | null;
  min_ms: number | null;
  avg_ms: number | null;
  max_ms: number | null;
  stddev_ms: number | null;
  error: string | null;
};

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

function mapHostRow(row: HostRow): HostRecord {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    category: row.category,
    status: row.status ?? 'Unknown',
    uptime: Number(row.uptime ?? 0),
    lastCheckedAt: row.last_checked_at ?? null,
  };
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
  db: PromiseDatabase,
  hostId: string
): Promise<HostAvailabilityStatistics> {
  const aggregates = await db.get<PingAggregateRow>(
    `
      SELECT
        COUNT(*) AS total_checks,
        COALESCE(SUM(reachable), 0) AS successful_checks,
        AVG(avg_ms) AS average_latency,
        MIN(min_ms) AS min_latency,
        MAX(max_ms) AS max_latency,
        MAX(checked_at) AS last_check_at
      FROM ping_checks
      WHERE host_id = ?
    `,
    [hostId]
  );

  if (!aggregates || !aggregates.total_checks) {
    return createEmptyPingStatistics();
  }

  const totalChecks = Number(aggregates.total_checks);
  const successfulChecks = Number(aggregates.successful_checks);
  const failedChecks = totalChecks - successfulChecks;
  const availability = roundAvailability(
    (successfulChecks / totalChecks) * 100
  );

  return {
    totalChecks,
    successfulChecks,
    failedChecks,
    availability,
    averageLatency: roundNullable(aggregates.average_latency, 3),
    minLatency: roundNullable(aggregates.min_latency, 3),
    maxLatency: roundNullable(aggregates.max_latency, 3),
    lastCheckAt: aggregates.last_check_at,
  };
}

async function updateHostAvailability(
  db: PromiseDatabase,
  hostId: string,
  status: HostStatus
): Promise<HostAvailabilityStatistics> {
  const stats = await getPingStatistics(db, hostId);

  await db.run(
    `
      UPDATE hosts
      SET status = ?, uptime = ?, last_checked_at = ?
      WHERE id = ?
    `,
    [status, stats.availability, stats.lastCheckAt, hostId]
  );

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

  const db = await database.connect();

  try {
    await db.run(
      `
        INSERT INTO hosts (id, name, address, category, status, uptime, last_checked_at)
        VALUES (?, ?, ?, ?, 'Unknown', 0, NULL)
      `,
      [hostId, parsedHost.name, parsedHost.address, parsedHost.category]
    );
  } finally {
    await db.close();
  }

  return {
    ...parsedHost,
    id: hostId,
    status: 'Unknown',
    uptime: 0,
    lastCheckedAt: null,
  };
}

async function read(where?: HostFilter): Promise<HostRecord[]> {
  const db = await database.connect();

  try {
    if (where) {
      const field = Object.keys(where)[0] as AllowedFilterField | undefined;

      if (!field || !ALLOWED_FILTER_FIELDS.has(field)) {
        throw new InvalidHostError('Invalid filter field');
      }

      const value = where[field];

      if (value === undefined) {
        throw new InvalidHostError('Invalid filter value');
      }

      if (typeof value === 'string') {
        const rows = await db.all<HostRow>(
          `
            SELECT id, name, address, category, status, uptime, last_checked_at
            FROM hosts
            WHERE LOWER(${field}) LIKE LOWER(?)
          `,
          [`%${value}%`]
        );

        return rows.map(mapHostRow);
      }

      const rows = await db.all<HostRow>(
        `
          SELECT id, name, address, category, status, uptime, last_checked_at
          FROM hosts
          WHERE ${field} = ?
        `,
        [value]
      );

      return rows.map(mapHostRow);
    }

    const rows = await db.all<HostRow>(
      `
        SELECT id, name, address, category, status, uptime, last_checked_at
        FROM hosts
      `
    );

    return rows.map(mapHostRow);
  } finally {
    await db.close();
  }
}

async function readById(id: string | undefined): Promise<HostRecord> {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  const db = await database.connect();
  let host: HostRow | undefined;

  try {
    host = await db.get<HostRow>(
      `
        SELECT id, name, address, category, status, uptime, last_checked_at
        FROM hosts
        WHERE id = ?
      `,
      [id]
    );
  } finally {
    await db.close();
  }

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

  const db = await database.connect();

  try {
    const result = await db.run(
      `
        UPDATE hosts
        SET name = ?, address = ?, category = ?
        WHERE id = ?
      `,
      [parsedHost.name, parsedHost.address, parsedHost.category, parsedHost.id]
    );

    if (!result.changes) {
      throw new HostNotFoundError('Host not found');
    }
  } finally {
    await db.close();
  }

  return readById(parsedHost.id);
}

async function remove(id: string | undefined): Promise<boolean> {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  const db = await database.connect();

  try {
    const result = await db.run('DELETE FROM hosts WHERE id = ?', [id]);

    if (!result.changes) {
      throw new HostNotFoundError('Host not found');
    }
  } finally {
    await db.close();
  }

  return true;
}

async function addPingResult(
  hostId: string,
  pingResult: PingResult
): Promise<PingState> {
  const db = await database.connect();
  const checkedAt = new Date().toISOString();

  try {
    await db.run(
      `
        INSERT INTO ping_checks (
          host_id,
          checked_at,
          reachable,
          transmitted,
          received,
          min_ms,
          avg_ms,
          max_ms,
          stddev_ms,
          output,
          error
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        hostId,
        checkedAt,
        1,
        pingResult.statistics.transmitted,
        pingResult.statistics.received,
        pingResult.statistics.min,
        pingResult.statistics.avg,
        pingResult.statistics.max,
        pingResult.statistics.stddev,
        pingResult.output,
        null,
      ]
    );

    const statistics = await updateHostAvailability(db, hostId, 'Online');

    return {
      checkedAt,
      reachable: true,
      statistics,
    };
  } finally {
    await db.close();
  }
}

async function addPingError(
  hostId: string,
  errorMessage: string
): Promise<PingState> {
  const db = await database.connect();
  const checkedAt = new Date().toISOString();

  try {
    await db.run(
      `
        INSERT INTO ping_checks (
          host_id,
          checked_at,
          reachable,
          transmitted,
          received,
          min_ms,
          avg_ms,
          max_ms,
          stddev_ms,
          output,
          error
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [hostId, checkedAt, 0, 0, 0, null, null, null, null, null, errorMessage]
    );

    const statistics = await updateHostAvailability(db, hostId, 'Offline');

    return {
      checkedAt,
      reachable: false,
      statistics,
    };
  } finally {
    await db.close();
  }
}

async function readPingHistory(
  hostId: string,
  limit: unknown = 20
): Promise<PingHistoryItem[]> {
  const db = await database.connect();

  try {
    const parsedLimit = Number.isNaN(Number(limit))
      ? 20
      : Math.min(Math.max(Number(limit), 1), 100);

    const historyRows = await db.all<PingHistoryRow>(
      `
        SELECT
          id,
          checked_at,
          reachable,
          transmitted,
          received,
          min_ms,
          avg_ms,
          max_ms,
          stddev_ms,
          error
        FROM ping_checks
        WHERE host_id = ?
        ORDER BY checked_at DESC, id DESC
        LIMIT ?
      `,
      [hostId, parsedLimit]
    );

    return historyRows.map((row) => ({
      id: Number(row.id),
      checkedAt: row.checked_at,
      reachable: Boolean(row.reachable),
      transmitted: Number(row.transmitted ?? 0),
      received: Number(row.received ?? 0),
      minMs: row.min_ms,
      avgMs: row.avg_ms,
      maxMs: row.max_ms,
      stddevMs: row.stddev_ms,
      error: row.error,
    }));
  } finally {
    await db.close();
  }
}

async function readDetails(
  hostId: string,
  limit: unknown = 20
): Promise<HostDetails> {
  const host = await readById(hostId);
  const history = await readPingHistory(hostId, limit);

  const db = await database.connect();

  try {
    const statistics = await getPingStatistics(db, hostId);

    return {
      host,
      statistics,
      history,
    };
  } finally {
    await db.close();
  }
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
