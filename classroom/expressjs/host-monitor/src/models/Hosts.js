import cuid from 'cuid';
import database from '../database/database.js';
import Migration from '../database/migration.js';
import { HostNotFoundError, InvalidHostError } from '../errors/HostError.js';
import { hostCreateSchema, hostWithIdSchema } from '../schemas/host.js';

const ALLOWED_FILTER_FIELDS = new Set([
  'id',
  'name',
  'address',
  'category',
  'status',
]);

function roundAvailability(value) {
  return Number(value.toFixed(2));
}

function mapHostRow(row) {
  if (!row) {
    return row;
  }

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

function createEmptyPingStatistics() {
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

async function getPingStatistics(db, hostId) {
  const aggregates = await db.get(
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
    averageLatency:
      aggregates.average_latency === null
        ? null
        : Number(aggregates.average_latency.toFixed(3)),
    minLatency:
      aggregates.min_latency === null
        ? null
        : Number(aggregates.min_latency.toFixed(3)),
    maxLatency:
      aggregates.max_latency === null
        ? null
        : Number(aggregates.max_latency.toFixed(3)),
    lastCheckAt: aggregates.last_check_at,
  };
}

async function updateHostAvailability(db, hostId, status) {
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

async function create({ name, address, category, id }) {
  await Migration.up();
  const hostId = id ?? cuid();

  let parsedHost;

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

async function read(where) {
  await Migration.up();
  const db = await database.connect();

  try {
    if (where) {
      const field = Object.keys(where)[0];
      const value = where[field];

      if (!ALLOWED_FILTER_FIELDS.has(field)) {
        throw new InvalidHostError('Invalid filter field');
      }

      if (typeof value === 'string') {
        const rows = await db.all(
          `
            SELECT id, name, address, category, status, uptime, last_checked_at
            FROM hosts
            WHERE LOWER(${field}) LIKE LOWER(?)
          `,
          [`%${value}%`]
        );

        return rows.map(mapHostRow);
      }

      const rows = await db.all(
        `
          SELECT id, name, address, category, status, uptime, last_checked_at
          FROM hosts
          WHERE ${field} = ?
        `,
        [value]
      );

      return rows.map(mapHostRow);
    }

    const rows = await db.all(
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

async function readById(id) {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  await Migration.up();
  const db = await database.connect();
  let host;

  try {
    host = await db.get(
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

async function update({ id, name, address, category }) {
  await Migration.up();

  let parsedHost;

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

async function remove(id) {
  if (!id) {
    throw new HostNotFoundError('Unable to find host');
  }

  await Migration.up();
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

async function addPingResult(hostId, pingResult) {
  await Migration.up();
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
        pingResult.statistics?.transmitted ?? 0,
        pingResult.statistics?.received ?? 0,
        pingResult.statistics?.min ?? null,
        pingResult.statistics?.avg ?? null,
        pingResult.statistics?.max ?? null,
        pingResult.statistics?.stddev ?? null,
        pingResult.output ?? null,
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

async function addPingError(hostId, errorMessage) {
  await Migration.up();
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

async function readPingHistory(hostId, limit = 20) {
  await Migration.up();
  const db = await database.connect();

  try {
    const parsedLimit = Number.isNaN(Number(limit))
      ? 20
      : Math.min(Math.max(Number(limit), 1), 100);

    const historyRows = await db.all(
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
      id: row.id,
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

async function readDetails(hostId, limit = 20) {
  const host = await readById(hostId);
  const history = await readPingHistory(hostId, limit);

  await Migration.up();
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
