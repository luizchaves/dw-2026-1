import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { parse } from '@/lib/ping.js';

describe('ping parser', () => {
  test('parses macOS ping output correctly', () => {
    const output = `PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=113 time=68.816 ms

--- 8.8.8.8 ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 68.816/68.816/68.816/nan ms`;

    const parsed = parse(output);

    assert.equal(parsed.ip, '8.8.8.8');
    assert.equal(parsed.packets.length, 1);
    assert.equal(parsed.packets[0].seq, 0);
    assert.equal(parsed.packets[0].ttl, 113);
    assert.equal(parsed.packets[0].time, 68.816);
    assert.equal(parsed.statistics.transmitted, 1);
    assert.equal(parsed.statistics.received, 1);
    assert.equal(parsed.statistics.losted, 0);
    assert.equal(parsed.statistics.min, 68.816);
    assert.equal(parsed.statistics.avg, 68.816);
    assert.equal(parsed.statistics.max, 68.816);
    assert.ok(Number.isNaN(parsed.statistics.stddev));
  });

  test('parses Alpine (Busybox) ping output correctly', () => {
    const output = `PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: seq=0 ttl=63 time=70.286 ms

--- 8.8.8.8 ping statistics ---
1 packets transmitted, 1 packets received, 0% packet loss
round-trip min/avg/max = 70.286/70.286/70.286 ms`;

    const parsed = parse(output);

    assert.equal(parsed.ip, '8.8.8.8');
    assert.equal(parsed.packets.length, 1);
    assert.equal(parsed.packets[0].seq, 0);
    assert.equal(parsed.packets[0].ttl, 63);
    assert.equal(parsed.packets[0].time, 70.286);
    assert.equal(parsed.statistics.transmitted, 1);
    assert.equal(parsed.statistics.received, 1);
    assert.equal(parsed.statistics.losted, 0);
    assert.equal(parsed.statistics.min, 70.286);
    assert.equal(parsed.statistics.avg, 70.286);
    assert.equal(parsed.statistics.max, 70.286);
    assert.ok(Number.isNaN(parsed.statistics.stddev));
  });

  test('parses Linux (iputils-ping) output correctly', () => {
    const output = `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=12.3 ms

--- 8.8.8.8 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 12.301/12.301/12.301/0.000 ms`;

    const parsed = parse(output);

    assert.equal(parsed.ip, '8.8.8.8');
    assert.equal(parsed.packets.length, 1);
    assert.equal(parsed.packets[0].seq, 1);
    assert.equal(parsed.packets[0].ttl, 118);
    assert.equal(parsed.packets[0].time, 12.3);
    assert.equal(parsed.statistics.transmitted, 1);
    assert.equal(parsed.statistics.received, 1);
    assert.equal(parsed.statistics.losted, 0);
    assert.equal(parsed.statistics.min, 12.301);
    assert.equal(parsed.statistics.avg, 12.301);
    assert.equal(parsed.statistics.max, 12.301);
    assert.equal(parsed.statistics.stddev, 0);
  });
});
