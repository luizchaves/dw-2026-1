import express from 'express';
import { HttpError } from './HttpError.js';

const routes = express.Router();

routes.get('/', (req, res) => {
  res.json({ message: 'Hello API' });
});

routes.get('/en', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

routes.get('/pt', (req, res) => {
  res.json({ message: 'Olá, Mundo!' });
});

routes.get('/hello/en/:name', (req, res) => {
  const { name } = req.params;

  res.json({ message: `Hello, ${name}!` });
});

routes.get('/hello/pt', (req, res) => {
  const { name } = req.query;

  if (!name) {
    throw new HttpError('Name query parameter is required');
  }

  res.json({ message: `Olá, ${name}!` });
});

routes.post('/hello/es', (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    throw new HttpError('Content-Type must be application/json');
  }

  const { name } = req.body;

  if (!name) {
    throw new HttpError('Name body parameter is required');
  }

  res.json({ message: `¡Hola, ${name}!` });
});

export default routes;
