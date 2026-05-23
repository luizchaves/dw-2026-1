import { existsSync, rmSync } from 'node:fs';
import getDatabaseFile from './dbFile.js';

const dbFile = getDatabaseFile();

if (existsSync(dbFile)) {
  rmSync(dbFile);
  console.log(`Removed database file: ${dbFile}`);
} else {
  console.log(`Database file not found: ${dbFile}`);
}
