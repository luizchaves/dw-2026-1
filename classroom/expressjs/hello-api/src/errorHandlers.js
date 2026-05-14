import { HttpError } from './HttpError.js';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
};

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};
