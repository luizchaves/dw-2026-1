import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/HttpError.js';

export const requireJsonContentType = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.headers['content-type'] !== 'application/json') {
    throw new HttpError('Content-Type must be application/json');
  }

  next();
};
