import { prisma } from '@/database/database.js';
import Host from '@/models/Hosts.js';
import seed from './seed.json' with { type: 'json' };

async function main(): Promise<void> {
  for (const host of seed.hosts) {
    await Host.create(host);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
