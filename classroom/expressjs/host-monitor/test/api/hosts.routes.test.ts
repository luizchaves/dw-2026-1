import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '@/index.js';
import type { HostRecord } from '@/types.js';

let userCounter = 0;

async function createAuthHeader(): Promise<Record<string, string>> {
  userCounter += 1;

  const response = await request(app)
    .post('/api/auth/register')
    .set('Content-Type', 'application/json')
    .send({
      name: `Hosts Test User ${userCounter}`,
      email: `hosts-${userCounter}@example.com`,
      password: 'secret123',
      passwordConfirmation: 'secret123',
    });

  assert.equal(response.status, 201);

  return {
    Authorization: `Bearer ${response.body.token}`,
  };
}

async function createHost(
  authHeader: Record<string, string>,
  payload: { name: string; address: string; category: string }
) {
  return request(app)
    .post('/api/hosts')
    .set(authHeader)
    .set('Content-Type', 'application/json')
    .send(payload);
}

describe('/api/hosts', () => {
  test('GET /api/hosts without valid JWT returns 401', async () => {
    const response = await request(app).get('/api/hosts');

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, {
      error: 'Invalid or missing authorization token',
    });
  });

  test('GET /api/hosts with invalid JWT returns 401', async () => {
    const response = await request(app)
      .get('/api/hosts')
      .set('Authorization', 'Bearer invalid-token');

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, {
      error: 'Invalid or missing authorization token',
    });
  });

  test('POST /api/hosts with valid JSON returns 201', async () => {
    const authHeader = await createAuthHeader();
    const hostPayload = {
      name: 'Server A',
      address: '127.0.0.1',
      category: 'Production',
    };

    const response = await createHost(authHeader, hostPayload);

    assert.equal(response.status, 201);
    assert.equal(response.body.name, hostPayload.name);
    assert.equal(response.body.address, hostPayload.address);
    assert.equal(response.body.category, hostPayload.category);
    assert.equal(response.body.status, 'Online');
    assert.equal(response.body.uptime, 100);
    assert.equal(typeof response.body.lastCheckedAt, 'string');
    assert.ok(response.body.id);
  });

  test('GET /api/hosts/:id returns host details', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Host Detail',
      address: '127.0.0.1',
      category: 'QA',
    });

    const response = await request(app)
      .get(`/api/hosts/${createResponse.body.id}`)
      .set(authHeader);

    assert.equal(response.status, 200);
    assert.equal(response.body.id, createResponse.body.id);
    assert.equal(response.body.name, 'Host Detail');
  });

  test('GET /api/hosts returns a list of hosts', async () => {
    const authHeader = await createAuthHeader();
    const response = await request(app).get('/api/hosts').set(authHeader);

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
  });

  test('POST /api/hosts without Content-Type application/json returns 400', async () => {
    const authHeader = await createAuthHeader();
    const response = await request(app)
      .post('/api/hosts')
      .set(authHeader)
      .set('Content-Type', 'text/plain')
      .send('name=Server A');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: 'Content-Type must be application/json',
    });
  });

  test('PUT /api/hosts/:id updates an existing host', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Server B',
      address: '127.0.0.1',
      category: 'Staging',
    });

    assert.equal(createResponse.status, 201);

    const updatedPayload = {
      name: 'Server B Updated',
      address: '127.0.0.1',
      category: 'Staging',
    };

    const response = await request(app)
      .put(`/api/hosts/${createResponse.body.id}`)
      .set(authHeader)
      .set('Content-Type', 'application/json')
      .send(updatedPayload);

    assert.equal(response.status, 200);
    assert.equal(response.body.id, createResponse.body.id);
    assert.equal(response.body.name, updatedPayload.name);
    assert.equal(response.body.status, 'Online');
  });

  test('DELETE /api/hosts/:id removes a host and returns 204', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Server C',
      address: '127.0.0.1',
      category: 'Development',
    });

    assert.equal(createResponse.status, 201);

    const response = await request(app)
      .delete(`/api/hosts/${createResponse.body.id}`)
      .set(authHeader);

    assert.equal(response.status, 204);
    assert.deepEqual(response.body, {});

    const listResponse = await request(app).get('/api/hosts').set(authHeader);

    assert.equal(listResponse.status, 200);
    assert.equal(
      listResponse.body.some(
        (host: HostRecord) => host.id === createResponse.body.id
      ),
      false
    );
  });

  test('PUT /api/hosts/:id for unknown host returns 400', async () => {
    const authHeader = await createAuthHeader();
    const response = await request(app)
      .put('/api/hosts/cj1234567890abcdef123456')
      .set(authHeader)
      .set('Content-Type', 'application/json')
      .send({
        name: 'Missing Host',
        address: '127.0.0.1',
        category: 'QA',
      });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Host not found' });
  });
});

describe('/api/hosts/:id/ping', () => {
  test('GET /api/hosts/:id/ping without count returns 200', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Ping Host A',
      address: '127.0.0.1',
      category: 'Production',
    });

    assert.equal(createResponse.status, 201);

    const response = await request(app)
      .get(`/api/hosts/${createResponse.body.id}/ping`)
      .set(authHeader);

    assert.equal(response.status, 200);
    assert.equal(response.body.host, '127.0.0.1');
    assert.equal(response.body.reachable, true);
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 1);
  });

  test('GET /api/hosts/:id/ping with count=1 returns 200', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Ping Host B',
      address: '127.0.0.1',
      category: 'Production',
    });

    assert.equal(createResponse.status, 201);

    const response = await request(app)
      .get(`/api/hosts/${createResponse.body.id}/ping?count=1`)
      .set(authHeader);

    assert.equal(response.status, 200);
    assert.equal(response.body.host, '127.0.0.1');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 1);
    assert.equal(response.body.statistics.transmitted, 1);
    assert.equal(response.body.hostStatus.status, 'Online');
  });

  test('GET /api/hosts/:id/ping with count=3 returns 200', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Ping Host C',
      address: '127.0.0.1',
      category: 'Production',
    });

    assert.equal(createResponse.status, 201);

    const response = await request(app)
      .get(`/api/hosts/${createResponse.body.id}/ping?count=3`)
      .set(authHeader);

    assert.equal(response.status, 200);
    assert.equal(response.body.host, '127.0.0.1');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 3);
    assert.equal(response.body.statistics.transmitted, 3);
  });

  test('GET /api/hosts/:id/details returns host, history and statistics', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Host Details Full',
      address: '127.0.0.1',
      category: 'Production',
    });

    const hostId = createResponse.body.id;

    await request(app).get(`/api/hosts/${hostId}/ping?count=1`).set(authHeader);

    const response = await request(app)
      .get(`/api/hosts/${hostId}/details`)
      .set(authHeader);

    assert.equal(response.status, 200);
    assert.equal(response.body.host.id, hostId);
    assert.ok(Array.isArray(response.body.history));
    assert.ok(response.body.history.length >= 1);
    assert.equal(typeof response.body.statistics.availability, 'number');
  });

  test('GET /api/hosts/:id/ping for unknown host returns 400', async () => {
    const authHeader = await createAuthHeader();
    const response = await request(app)
      .get('/api/hosts/cj1234567890abcdef123456/ping')
      .set(authHeader);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Host not found' });
  });

  test('GET /api/hosts/:id/ping for unreachable host returns 200 and marks offline', async () => {
    const authHeader = await createAuthHeader();
    const createResponse = await createHost(authHeader, {
      name: 'Unreachable Host',
      address: 'unreachable.invalid',
      category: 'Production',
    });

    assert.equal(createResponse.status, 201);

    const response = await request(app)
      .get(`/api/hosts/${createResponse.body.id}/ping`)
      .set(authHeader);

    assert.equal(response.status, 200);
    assert.equal(response.body.reachable, false);
    assert.equal(response.body.error, 'Unknown host');
    assert.equal(response.body.hostStatus.status, 'Offline');
  });
});

test('GET unknown route returns 404', async () => {
  const response = await request(app).get('/api/nao-existe');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not Found' });
});
