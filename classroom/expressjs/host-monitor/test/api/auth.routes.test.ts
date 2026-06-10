import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '@/index.js';

describe('/api/auth', () => {
  test('POST /api/auth/register creates user and returns jwt', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: 'secret123',
        passwordConfirmation: 'secret123',
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.user.name, 'Maria Silva');
    assert.equal(response.body.user.email, 'maria@example.com');
    assert.equal(typeof response.body.user.id, 'string');
    assert.equal(typeof response.body.token, 'string');
    assert.equal(response.body.token.split('.').length, 3);
    assert.equal(response.body.user.passwordHash, undefined);
  });

  test('POST /api/auth/register rejects password confirmation mismatch', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Joao Silva',
        email: 'joao@example.com',
        password: 'secret123',
        passwordConfirmation: 'other123',
      });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: 'Password confirmation does not match',
    });
  });

  test('POST /api/auth/register rejects duplicated email', async () => {
    const payload = {
      name: 'Duplicated User',
      email: 'duplicated@example.com',
      password: 'secret123',
      passwordConfirmation: 'secret123',
    };

    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send(payload);

    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.equal(response.status, 409);
    assert.deepEqual(response.body, { error: 'Email already registered' });
  });

  test('POST /api/auth/login returns jwt for valid credentials', async () => {
    const email = 'login@example.com';
    const password = 'secret123';

    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Login User',
        email,
        password,
        passwordConfirmation: password,
      });

    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    assert.equal(response.status, 200);
    assert.equal(response.body.user.email, email);
    assert.equal(typeof response.body.token, 'string');
    assert.equal(response.body.token.split('.').length, 3);
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'missing@example.com',
        password: 'secret123',
      });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'Invalid email or password' });
  });
});
