import { ping } from '../lib/ping.js';
import Host from '../models/Hosts.js';

export async function pingAllHosts() {
  const hosts = await Host.read();

  for (const host of hosts) {
    try {
      const result = await ping(host.address, 1);

      await Host.addPingResult(host.id, result);
    } catch (error) {
      await Host.addPingError(host.id, error.message);
    }
  }
}
