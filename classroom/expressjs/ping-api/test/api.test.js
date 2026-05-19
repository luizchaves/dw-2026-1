import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../src/index.js';

describe('/api/ping', () => {
  test('GET /api/ping without host query returns 400', async () => {
    const response = await request(app).get('/api/ping');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Host is required' });
  });

  test('GET /api/ping with host and count=1 returns 200', async () => {
    const response = await request(app).get(
      '/api/ping?host=google.com&count=1'
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.host, 'google.com');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 1);
    assert.equal(response.body.statistics.transmitted, 1);
  });

  test('GET /api/ping with host and count=3 returns 200', async () => {
    const response = await request(app).get(
      '/api/ping?host=google.com&count=3'
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.host, 'google.com');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 3);
    assert.equal(response.body.statistics.transmitted, 3);
  });

  test('GET /api/ping with host only returns 200', async () => {
    const response = await request(app).get('/api/ping?host=google.com');

    assert.equal(response.status, 200);
    assert.equal(response.body.host, 'google.com');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 1);
  });

  test('GET /api/ping with unknown host returns 400', async () => {
    const response = await request(app).get('/api/ping?host=unknownhost.com');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Unknown host' });
  });
});

test('GET unknown route returns 404', async () => {
  const response = await request(app).get('/api/nao-existe');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not Found' });
});
