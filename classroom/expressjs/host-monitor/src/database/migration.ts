import type { DatabaseRow, PromiseDatabase } from './database.js';
import database from './database.js';

type TableInfoRow = {
  name: string;
} & DatabaseRow;

async function ensureHostsColumns(db: PromiseDatabase): Promise<void> {
  const columns = await db.all<TableInfoRow>('PRAGMA table_info(hosts)');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('status')) {
    await db.run("ALTER TABLE hosts ADD COLUMN status TEXT DEFAULT 'Unknown'");
  }

  if (!columnNames.has('uptime')) {
    await db.run('ALTER TABLE hosts ADD COLUMN uptime REAL DEFAULT 0');
  }

  if (!columnNames.has('last_checked_at')) {
    await db.run('ALTER TABLE hosts ADD COLUMN last_checked_at TEXT');
  }
}

async function up(): Promise<void> {
  const db = await database.connect();

  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'Unknown',
        uptime REAL NOT NULL DEFAULT 0,
        last_checked_at TEXT
      )
    `);

    await ensureHostsColumns(db);

    await db.run(`
      CREATE TABLE IF NOT EXISTS ping_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id TEXT NOT NULL,
        checked_at TEXT NOT NULL,
        reachable INTEGER NOT NULL,
        transmitted INTEGER DEFAULT 0,
        received INTEGER DEFAULT 0,
        min_ms REAL,
        avg_ms REAL,
        max_ms REAL,
        stddev_ms REAL,
        output TEXT,
        error TEXT,
        FOREIGN KEY(host_id) REFERENCES hosts(id) ON DELETE CASCADE
      )
    `);

    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_ping_checks_host_checked_at
      ON ping_checks(host_id, checked_at DESC)
    `);
  } finally {
    await db.close();
  }
}

export default { up };
