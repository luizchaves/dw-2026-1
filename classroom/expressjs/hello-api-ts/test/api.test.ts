import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import request from 'supertest';

import app from '../src/index.js';

test('GET /api/ returns base message', async () => {
  const response = await request(app).get('/api/');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { message: 'Hello API' });
});

test('GET /api/en returns hello in English', async () => {
  const response = await request(app).get('/api/en');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { message: 'Hello, World!' });
});

test('GET /api/pt returns hello in Portuguese', async () => {
  const response = await request(app).get('/api/pt');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { message: 'Olá, Mundo!' });
});

describe('/api/hello', () => {
  test('GET /api/hello/en/:name returns success', async () => {
    const response = await request(app).get('/api/hello/en/John');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: 'Hello, John!' });
  });

  test('GET /api/hello/en without :name returns 404', async () => {
    const response = await request(app).get('/api/hello/en');

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { error: 'Not Found' });
  });

  test('GET /api/hello/pt with name query returns 200', async () => {
    const response = await request(app).get('/api/hello/pt?name=John');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: 'Olá, John!' });
  });

  test('GET /api/hello/pt without name query returns 400', async () => {
    const response = await request(app).get('/api/hello/pt');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: 'Name query parameter is required',
    });
  });

  test('POST /api/hello/es with valid JSON returns 200', async () => {
    const response = await request(app)
      .post('/api/hello/es')
      .set('Content-Type', 'application/json')
      .send({ name: 'John' });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: '¡Hola, John!' });
  });

  test('POST /api/hello/es without Content-Type application/json returns 400', async () => {
    const response = await request(app)
      .post('/api/hello/es')
      .set('Content-Type', 'text/plain')
      .send('name=John');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: 'Content-Type must be application/json',
    });
  });

  test('POST /api/hello/es without name in body returns 400', async () => {
    const response = await request(app)
      .post('/api/hello/es')
      .set('Content-Type', 'application/json')
      .send({ person: 'John' });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: 'Name body parameter is required',
    });
  });
});

test('GET unknown route returns 404', async () => {
  const response = await request(app).get('/api/nao-existe');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not Found' });
});
