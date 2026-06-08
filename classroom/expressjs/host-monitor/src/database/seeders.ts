import Host from '../models/Hosts.js';
import seed from './seeders.json' with { type: 'json' };

async function up(): Promise<void> {
  for (const host of seed.hosts) {
    await Host.create(host);
  }
}

export default { up };
