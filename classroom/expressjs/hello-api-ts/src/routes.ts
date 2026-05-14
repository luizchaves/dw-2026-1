import express from 'express';
import { HttpError } from './HttpError.js';

const routes = express.Router();

routes.get('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

routes.get('/en', (_req, res) => {
  res.json({ message: 'Hello, World!' });
});

routes.get('/pt', (_req, res) => {
  res.json({ message: 'Olá, Mundo!' });
});

routes.get('/hello/en/:name', (req, res) => {
  const { name } = req.params;
  res.json({ message: `Hello, ${name}!` });
});

routes.get('/hello/pt', (req, res) => {
  const rawName = req.query.name;
  const name = typeof rawName === 'string' ? rawName : '';

  if (!name) {
    throw new HttpError('Name query parameter is required');
  }

  res.json({ message: `Olá, ${name}!` });
});

routes.post('/hello/es', (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    throw new HttpError('Content-Type must be application/json');
  }

  const { name } = req.body as { name?: string };

  if (!name) {
    throw new HttpError('Name body parameter is required');
  }

  res.json({ message: `¡Hola, ${name}!` });
});

export default routes;
