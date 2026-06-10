import 'dotenv/config';
import { defineConfig } from 'prisma/config';

function buildPostgresUrl(host: string, port: string): string {
  const database = process.env.POSTGRES_DB ?? 'host_monitor';
  const user = process.env.POSTGRES_USER ?? 'host_monitor';
  const password = process.env.POSTGRES_PASSWORD ?? 'host_monitor';

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

const databaseUrl =
  process.env.DATABASE_URL ??
  buildPostgresUrl(
    process.env.POSTGRES_HOST ?? 'localhost',
    process.env.POSTGRES_PORT ?? '5432',
  );

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
