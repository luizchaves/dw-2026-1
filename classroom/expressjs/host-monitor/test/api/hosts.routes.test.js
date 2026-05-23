import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../../src/index.js';

describe('/api/hosts', () => {
  test('POST /api/hosts with valid JSON returns 201', async () => {
    const hostPayload = {
      name: 'Server A',
      address: '192.168.0.10',
      category: 'Production',
    };

    const response = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send(hostPayload);

    assert.equal(response.status, 201);
    assert.equal(response.body.name, hostPayload.name);
    assert.equal(response.body.address, hostPayload.address);
    assert.equal(response.body.category, hostPayload.category);
    assert.equal(response.body.status, 'Online');
    assert.equal(typeof response.body.uptime, 'string');
    assert.equal(Number.isNaN(Date.parse(response.body.uptime)), false);
    assert.ok(response.body.id);
  });

  test('GET /api/hosts returns a list of hosts', async () => {
    const response = await request(app).get('/api/hosts');

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
  });

  test('POST /api/hosts without Content-Type application/json returns 400', async () => {
    const response = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'text/plain')
      .send('name=Server A');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: 'Content-Type must be application/json',
    });
  });

  test('PUT /api/hosts/:id updates an existing host', async () => {
    const createResponse = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Server B',
        address: '192.168.0.11',
        category: 'Staging',
      });

    assert.equal(createResponse.status, 201);

    const updatedPayload = {
      name: 'Server B Updated',
      address: '192.168.0.11',
      category: 'Staging',
      status: 'Online',
      uptime: '10 days',
    };

    const response = await request(app)
      .put(`/api/hosts/${createResponse.body.id}`)
      .set('Content-Type', 'application/json')
      .send(updatedPayload);

    assert.equal(response.status, 200);
    assert.equal(response.body.id, createResponse.body.id);
    assert.equal(response.body.name, updatedPayload.name);
    assert.equal(response.body.status, updatedPayload.status);
  });

  test('DELETE /api/hosts/:id removes a host and returns 204', async () => {
    const createResponse = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Server C',
        address: '192.168.0.12',
        category: 'Development',
      });

    assert.equal(createResponse.status, 201);

    const response = await request(app).delete(
      `/api/hosts/${createResponse.body.id}`
    );

    assert.equal(response.status, 204);
    assert.deepEqual(response.body, {});

    const listResponse = await request(app).get('/api/hosts');

    assert.equal(listResponse.status, 200);
    assert.equal(
      listResponse.body.some((host) => host.id === createResponse.body.id),
      false
    );
  });

  test('PUT /api/hosts/:id for unknown host returns 400', async () => {
    const response = await request(app)
      .put('/api/hosts/cj1234567890abcdef123456')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Missing Host',
        address: '192.168.0.13',
        category: 'QA',
        status: 'Online',
        uptime: '1 day',
      });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Host not found' });
  });
});

describe('/api/hosts/:id/ping', () => {
  test('GET /api/hosts/:id/ping without count returns 200', async () => {
    const createResponse = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Ping Host A',
        address: '127.0.0.1',
        category: 'Production',
      });

    assert.equal(createResponse.status, 201);

    const response = await request(app).get(
      `/api/hosts/${createResponse.body.id}/ping`
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.host, '127.0.0.1');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 1);
  });

  test('GET /api/hosts/:id/ping with count=1 returns 200', async () => {
    const createResponse = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Ping Host B',
        address: '127.0.0.1',
        category: 'Production',
      });

    assert.equal(createResponse.status, 201);

    const response = await request(app).get(
      `/api/hosts/${createResponse.body.id}/ping?count=1`
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.host, '127.0.0.1');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 1);
    assert.equal(response.body.statistics.transmitted, 1);
  });

  test('GET /api/hosts/:id/ping with count=3 returns 200', async () => {
    const createResponse = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Ping Host C',
        address: '127.0.0.1',
        category: 'Production',
      });

    assert.equal(createResponse.status, 201);

    const response = await request(app).get(
      `/api/hosts/${createResponse.body.id}/ping?count=3`
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.host, '127.0.0.1');
    assert.ok(Array.isArray(response.body.packets));
    assert.equal(response.body.packets.length, 3);
    assert.equal(response.body.statistics.transmitted, 3);
  });

  test('GET /api/hosts/:id/ping for unknown host returns 400', async () => {
    const response = await request(app).get(
      '/api/hosts/cj1234567890abcdef123456/ping'
    );

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Host not found' });
  });

  test('GET /api/hosts/:id/ping for unreachable host returns 400', async () => {
    const createResponse = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Unreachable Host',
        address: '192.0.2.1',
        category: 'Production',
      });

    assert.equal(createResponse.status, 201);

    const response = await request(app).get(
      `/api/hosts/${createResponse.body.id}/ping`
    );

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'Unknown host' });
  });
});

test('GET unknown route returns 404', async () => {
  const response = await request(app).get('/api/nao-existe');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not Found' });
});
