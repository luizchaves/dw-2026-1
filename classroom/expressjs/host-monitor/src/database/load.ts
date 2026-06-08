import Migration from './migration.js';
import Seed from './seeders.js';

async function load(): Promise<void> {
  await Migration.up();
  await Seed.up();
}

load();
