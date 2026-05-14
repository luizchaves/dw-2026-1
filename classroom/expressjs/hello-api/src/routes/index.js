import express from 'express';
import { z } from 'zod';
import {
  requiredTrimmedString,
  validateRequest,
} from '../middleware/validation.js';
import { requireJsonContentType } from '../middleware/requireJsonContentType.js';

const routes = express.Router();

const nameParamSchema = z.object({
  name: requiredTrimmedString('Name path parameter is required'),
});

const nameQuerySchema = z.object({
  name: requiredTrimmedString('Name query parameter is required'),
});

const nameBodySchema = z.object({
  name: requiredTrimmedString('Name body parameter is required'),
});

routes.get('/', (req, res) => {
  res.json({ message: 'Hello API' });
});

routes.get('/en', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

routes.get('/pt', (req, res) => {
  res.json({ message: 'Olá, Mundo!' });
});

routes.get(
  '/hello/en/:name',
  validateRequest({ params: nameParamSchema }),
  (req, res) => {
    const { name } = res.locals.validated.params;

    res.json({ message: `Hello, ${name}!` });
  }
);

routes.get(
  '/hello/pt',
  validateRequest({ query: nameQuerySchema }),
  (req, res) => {
    const { name } = res.locals.validated.query;

    res.json({ message: `Olá, ${name}!` });
  }
);

routes.post(
  '/hello/es',
  requireJsonContentType,
  validateRequest({ body: nameBodySchema }),
  (req, res) => {
    const { name } = res.locals.validated.body;

    res.json({ message: `¡Hola, ${name}!` });
  }
);

export default routes;
