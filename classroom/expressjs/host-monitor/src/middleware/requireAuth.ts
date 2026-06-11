import type { RequestHandler } from 'express';

import { HttpError } from '@/errors/HttpError.js';
import { verifyJwt } from '@/lib/jwt.js';

const getBearerToken = (authorization: string | undefined): string | null => {
  if (authorization === undefined) {
    return null;
  }

  const [scheme, token, ...extraParts] = authorization.split(' ');

  if (scheme !== 'Bearer' || token === undefined || extraParts.length > 0) {
    return null;
  }

  return token;
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = getBearerToken(req.get('Authorization'));

  if (token === null || verifyJwt(token) === null) {
    throw new HttpError('Invalid or missing authorization token', 401);
  }

  next();
};
