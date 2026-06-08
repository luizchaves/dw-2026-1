import { DatabaseSync } from 'node:sqlite';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type DatabaseValue = null | number | bigint | string | NodeJS.ArrayBufferView;
type DatabaseParams = DatabaseValue | DatabaseValue[];
export type DatabaseRow = Record<string, DatabaseValue>;

export type DatabaseRunResult = {
  changes: number;
  lastID: number;
};

export type PromiseDatabase = {
  run(sql: string, params?: DatabaseParams): Promise<DatabaseRunResult>;
  get<T extends DatabaseRow = DatabaseRow>(
    sql: string,
    params?: DatabaseParams
  ): Promise<T | undefined>;
  all<T extends DatabaseRow = DatabaseRow>(
    sql: string,
    params?: DatabaseParams
  ): Promise<T[]>;
  close(): Promise<void>;
};

const databaseDirectory = fileURLToPath(new URL('.', import.meta.url));

const DB_FILES_BY_ENV: Record<string, string> = {
  test: resolve(databaseDirectory, 'db.test.sqlite'),
  development: resolve(databaseDirectory, 'db.dev.sqlite'),
  production: resolve(databaseDirectory, 'db.sqlite'),
};

const nodeEnv = process.env.NODE_ENV ?? 'development';
const dbFile = DB_FILES_BY_ENV[nodeEnv] ?? DB_FILES_BY_ENV.development;

function parseParams(params: DatabaseParams = []): DatabaseValue[] {
  return Array.isArray(params) ? params : [params];
}

function parseRow<T extends DatabaseRow>(row: unknown): T | undefined {
  return row ? ({ ...(row as DatabaseRow) } as T) : undefined;
}

function parseRows<T extends DatabaseRow>(rows: unknown[]): T[] {
  return rows.map((row) => ({ ...(row as DatabaseRow) }) as T);
}

function createPromiseDatabase(database: DatabaseSync): PromiseDatabase {
  return {
    async run(sql, params) {
      const result = database.prepare(sql).run(...parseParams(params));

      return {
        changes: Number(result.changes),
        lastID: Number(result.lastInsertRowid),
      };
    },

    async get(sql, params) {
      return parseRow(database.prepare(sql).get(...parseParams(params)));
    },

    async all(sql, params) {
      return parseRows(database.prepare(sql).all(...parseParams(params)));
    },

    async close() {
      database.close();
    },
  };
}

async function connect(): Promise<PromiseDatabase> {
  return createPromiseDatabase(new DatabaseSync(dbFile));
}

function dropDatabase(): void {
  if (existsSync(dbFile)) {
    rmSync(dbFile);
    console.log(`Removed database file: ${dbFile}`);
  } else {
    console.log(`Database file not found: ${dbFile}`);
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename && process.argv[2] === 'drop') {
  dropDatabase();
}

export default { connect, dropDatabase, dbFile };
