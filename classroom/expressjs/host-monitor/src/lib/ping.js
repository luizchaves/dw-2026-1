import util from 'node:util';
import { exec } from 'node:child_process';

const execAsync = util.promisify(exec);

export async function ping(host, count = 1) {
  try {
    const command = `ping -c ${count} ${host}`;

    const { stdout } = await execAsync(command);

    const ping = { host, ...parse(stdout) };

    return ping;
  } catch (error) {
    throw new Error('Unknown host');
  }
}

export function parse(output) {
  const ping = { output };

  // ip
  let regex = /\(([\d\.]+)\)/;
  let match = output.match(regex);
  ping.ip = match[1];

  // packets
  ping.packets = [];
  regex = /icmp_seq=(?<seq>\d+) ttl=(?<ttl>\d+) time=(?<time>[\d\.]+)/g;
  while ((match = regex.exec(output))) {
    const {
      groups: { seq, ttl, time },
    } = match;

    ping.packets.push({
      seq: parseInt(seq),
      ttl: parseInt(ttl),
      time: parseFloat(time),
    });
  }

  // statistics
  regex =
    /(?<transmitted>\d+) packets transmitted, (?<received>\d+) (packets received|received)/;
  const {
    groups: { transmitted, received },
  } = output.match(regex);
  const losted = transmitted - received;

  regex =
    /min\/avg\/max\/(stddev|mdev) = (?<min>[\d.]+)\/(?<avg>[\d.]+)\/(?<max>[\d.]+)\/(?<stddev>[\d.]+|nan)/;
  const {
    groups: { min, avg, max, stddev },
  } = output.match(regex);

  ping.statistics = {
    transmitted: parseInt(transmitted),
    received: parseInt(received),
    losted: losted,
    min: parseFloat(min),
    avg: parseFloat(avg),
    max: parseFloat(max),
    stddev: Number.isNaN(parseFloat(stddev)) ? NaN : parseFloat(stddev),
  };

  return ping;
}
