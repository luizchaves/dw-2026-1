import util from 'node:util';
import { exec } from 'node:child_process';

import type { PingResult } from '@/types.js';

const execAsync = util.promisify(exec);

function requireMatch(
  match: RegExpMatchArray | null,
  message: string
): RegExpMatchArray {
  if (!match) {
    throw new Error(message);
  }

  return match;
}

function requireGroups(
  match: RegExpExecArray | RegExpMatchArray | null,
  message: string
): Record<string, string> {
  if (!match?.groups) {
    throw new Error(message);
  }

  return match.groups;
}

export async function ping(host: string, count = 1): Promise<PingResult> {
  try {
    const command = `ping -c ${count} ${host}`;

    const { stdout } = await execAsync(command);

    const ping = { host, ...parse(stdout) };

    return ping;
  } catch (error) {
    throw new Error('Unknown host');
  }
}

export function parse(output: string): Omit<PingResult, 'host'> {
  const ping: Omit<PingResult, 'host'> = {
    output,
    ip: '',
    packets: [],
    statistics: {
      transmitted: 0,
      received: 0,
      losted: 0,
      min: 0,
      avg: 0,
      max: 0,
      stddev: 0,
    },
  };

  // ip
  let regex = /\(([\d\.]+)\)/;
  const ipMatch = requireMatch(output.match(regex), 'Invalid ping output');
  ping.ip = ipMatch[1];

  // packets
  regex = /(?:icmp_)?seq=(?<seq>\d+) ttl=(?<ttl>\d+) time=(?<time>[\d\.]+)/g;
  let packetMatch: RegExpExecArray | null;
  while ((packetMatch = regex.exec(output))) {
    const { seq, ttl, time } = requireGroups(
      packetMatch,
      'Invalid ping packet'
    );

    ping.packets.push({
      seq: parseInt(seq),
      ttl: parseInt(ttl),
      time: parseFloat(time),
    });
  }

  // statistics
  regex =
    /(?<transmitted>\d+) packets transmitted, (?<received>\d+) (packets received|received)/;
  const { transmitted, received } = requireGroups(
    output.match(regex),
    'Invalid ping statistics'
  );
  const transmittedCount = parseInt(transmitted);
  const receivedCount = parseInt(received);
  const losted = transmittedCount - receivedCount;

  regex =
    /min\/avg\/max(?:\/(?:stddev|mdev))? = (?<min>[\d.]+)\/(?<avg>[\d.]+)\/(?<max>[\d.]+)(?:\/(?<stddev>[\d.]+|nan))?/;
  const { min, avg, max, stddev } = requireGroups(
    output.match(regex),
    'Invalid ping timing statistics'
  );

  ping.statistics = {
    transmitted: transmittedCount,
    received: receivedCount,
    losted: losted,
    min: parseFloat(min),
    avg: parseFloat(avg),
    max: parseFloat(max),
    stddev: Number.isNaN(parseFloat(stddev)) ? NaN : parseFloat(stddev),
  };

  return ping;
}
