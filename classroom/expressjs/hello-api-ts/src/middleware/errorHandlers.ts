import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../errors/HttpError.js';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err.stack);
  return res.status(500).json({ error: 'Internal Server Error' });
};
