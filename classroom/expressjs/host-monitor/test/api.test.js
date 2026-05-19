import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../src/index.js';

describe('/api/hosts', () => {
  test('POST /api/hosts with valid JSON returns 201', async () => {
    const hostPayload = {
      name: 'Server A',
      ip: '192.168.0.10',
      os: 'Linux',
      group: 'Production',
      status: 'Online',
      uptime: '24 days',
    };

    const response = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send(hostPayload);

    assert.equal(response.status, 201);
    assert.equal(response.body.name, hostPayload.name);
    assert.equal(response.body.ip, hostPayload.ip);
    assert.equal(response.body.os, hostPayload.os);
    assert.equal(response.body.group, hostPayload.group);
    assert.equal(response.body.status, hostPayload.status);
    assert.equal(response.body.uptime, hostPayload.uptime);
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
        ip: '192.168.0.11',
        os: 'Windows',
        group: 'Staging',
        status: 'Manutenção',
        uptime: '8 days',
      });

    assert.equal(createResponse.status, 201);

    const updatedPayload = {
      name: 'Server B Updated',
      ip: '192.168.0.11',
      os: 'Windows Server',
      group: 'Staging',
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
    assert.equal(response.body.os, updatedPayload.os);
    assert.equal(response.body.status, updatedPayload.status);
  });

  test('DELETE /api/hosts/:id removes a host and returns 204', async () => {
    const createResponse = await request(app)
      .post('/api/hosts')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Server C',
        ip: '192.168.0.12',
        os: 'macOS',
        group: 'Development',
        status: 'Offline',
        uptime: '0 days',
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
        ip: '192.168.0.13',
        os: 'Linux',
        group: 'QA',
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
        ip: '127.0.0.1',
        os: 'Linux',
        group: 'Production',
        status: 'Online',
        uptime: '24 days',
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
        ip: '127.0.0.1',
        os: 'Linux',
        group: 'Production',
        status: 'Online',
        uptime: '24 days',
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
        ip: '127.0.0.1',
        os: 'Linux',
        group: 'Production',
        status: 'Online',
        uptime: '24 days',
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
        ip: '192.0.2.1',
        os: 'Linux',
        group: 'Production',
        status: 'Online',
        uptime: '0 days',
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
