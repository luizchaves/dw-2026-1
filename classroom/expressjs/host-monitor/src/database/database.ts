import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@/generated/prisma/client.js';

const databaseDirectory = fileURLToPath(new URL('.', import.meta.url));

const DB_FILES_BY_ENV: Record<string, string> = {
  test: resolve(databaseDirectory, 'db.test.sqlite'),
  development: resolve(databaseDirectory, 'db.dev.sqlite'),
  production: resolve(databaseDirectory, 'db.sqlite'),
};

const nodeEnv = process.env.NODE_ENV ?? 'development';
const dbFile = DB_FILES_BY_ENV[nodeEnv] ?? DB_FILES_BY_ENV.development;
const databaseUrl = `file:${dbFile}`;
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

const prisma = new PrismaClient({ adapter });

export { databaseUrl, dbFile, prisma };
export default { databaseUrl, dbFile, prisma };
