import { ping } from '@/lib/ping.js';
import Host from '@/models/Hosts.js';

export async function pingAllHosts(): Promise<void> {
  const hosts = await Host.read();

  for (const host of hosts) {
    try {
      const result = await ping(host.address, 1);

      await Host.addPingResult(host.id, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown host';

      await Host.addPingError(host.id, message);
    }
  }
}
