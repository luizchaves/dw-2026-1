import { resolve } from 'node:path';

const DB_FILES_BY_ENV = {
  test: resolve('src', 'database', 'db.test.sqlite'),
  development: resolve('src', 'database', 'db.dev.sqlite'),
  production: resolve('src', 'database', 'db.sqlite'),
};

function getDatabaseFile() {
  return DB_FILES_BY_ENV[process.env.NODE_ENV] ?? DB_FILES_BY_ENV.development;
}

export default getDatabaseFile;
