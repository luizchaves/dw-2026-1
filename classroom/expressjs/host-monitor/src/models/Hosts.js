import cuid from 'cuid';
import database from '../database/database.js';
import Migration from '../database/migration.js';
import { HostNotFoundError, InvalidHostError } from '../errors/HostError.js';
import { hostSchema, hostWithIdSchema } from '../schemas/host.js';

const ALLOWED_FILTER_FIELDS = new Set([
  'id',
  'name',
  'address',
  'category',
  'status',
  'uptime',
]);

async function create({ name, address, category, status, id }) {
  await Migration.up();
  const hostId = id ?? cuid();
  const createdAt = new Date().toISOString();

  let parsedHost;

  try {
    parsedHost = hostSchema.parse({
      name,
      address,
      category,
      status,
      uptime: createdAt,
    });
  } catch {
    throw new InvalidHostError('Error when passing parameters');
  }

  const newHost = { ...parsedHost, id: hostId };

  const db = await database.connect();

  try {
    await db.run(
      'INSERT INTO hosts (id, name, address, category, status, uptime) VALUES (?, ?, ?, ?, ?, ?)',
      [
        newHost.id,
        newHost.name,
        newHost.address,
        newHost.category,
        newHost.status,
        newHost.uptime,
      ]
    );
  } finally {
    await db.close();
  }

  return newHost;
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

      const column = field;

      if (typeof value === 'string') {
        return db.all(
          `SELECT id, name, address, category, status, uptime FROM hosts WHERE LOWER(${column}) LIKE LOWER(?)`,
          [`%${value}%`]
        );
      }

      return db.all(
        `SELECT id, name, address, category, status, uptime FROM hosts WHERE ${column} = ?`,
        [value]
      );
    }

    return db.all(
      'SELECT id, name, address, category, status, uptime FROM hosts'
    );
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
      'SELECT id, name, address, category, status, uptime FROM hosts WHERE id = ?',
      [id]
    );
  } finally {
    await db.close();
  }

  if (!host) {
    throw new HostNotFoundError('Host not found');
  }

  return host;
}

async function update({ id, name, address, category, status, uptime }) {
  await Migration.up();

  let parsedHost;

  try {
    parsedHost = hostWithIdSchema.parse({
      id,
      name,
      address,
      category,
      status,
      uptime,
    });
  } catch {
    throw new InvalidHostError('Error when passing parameters');
  }

  const db = await database.connect();

  try {
    const result = await db.run(
      'UPDATE hosts SET name = ?, address = ?, category = ?, status = ?, uptime = ? WHERE id = ?',
      [
        parsedHost.name,
        parsedHost.address,
        parsedHost.category,
        parsedHost.status,
        parsedHost.uptime,
        parsedHost.id,
      ]
    );

    if (!result.changes) {
      throw new HostNotFoundError('Host not found');
    }
  } finally {
    await db.close();
  }

  const newHost = parsedHost;

  return newHost;
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

export default { create, read, readById, update, remove };
