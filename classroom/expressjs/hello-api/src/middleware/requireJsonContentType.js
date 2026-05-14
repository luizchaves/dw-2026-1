import { HttpError } from '../errors/HttpError.js';

export const requireJsonContentType = (req, _res, next) => {
  if (req.headers['content-type'] !== 'application/json') {
    throw new HttpError('Content-Type must be application/json');
  }

  next();
};
