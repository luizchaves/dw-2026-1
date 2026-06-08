import type { Request, RequestHandler } from 'express';
import { z } from 'zod';

import { HttpError } from '../errors/HttpError.js';

type RequestValidationSchemas = {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
};

const getFirstIssueMessage = (
  error: z.ZodError,
  fallbackMessage: string
): string => error.issues[0]?.message ?? fallbackMessage;

const parseWithHttpError = <T>(
  schema: z.ZodType<T>,
  input: unknown,
  fallbackMessage: string
): T => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new HttpError(getFirstIssueMessage(result.error, fallbackMessage));
  }

  return result.data;
};

export const validateRequest =
  ({ params, query, body }: RequestValidationSchemas = {}): RequestHandler =>
  (req, _res, next) => {
    try {
      if (params) {
        req.params = parseWithHttpError(
          params,
          req.params,
          'Invalid path parameters'
        ) as Request['params'];
      }

      if (query) {
        req.query = parseWithHttpError(
          query,
          req.query,
          'Invalid query parameters'
        ) as Request['query'];
      }

      if (body) {
        req.body = parseWithHttpError(body, req.body, 'Invalid body');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
