import { z } from 'zod';

import { HttpError } from '../errors/HttpError.js';

const getFirstIssueMessage = (error, fallbackMessage) =>
  error.issues[0]?.message ?? fallbackMessage;

const parseWithHttpError = (schema, input, fallbackMessage) => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new HttpError(getFirstIssueMessage(result.error, fallbackMessage));
  }

  return result.data;
};

export const validateRequest =
  ({ params, query, body } = {}) =>
  (req, res, next) => {
    try {
      res.locals.validated = {
        params: params
          ? parseWithHttpError(params, req.params, 'Invalid path parameters')
          : undefined,
        query: query
          ? parseWithHttpError(query, req.query, 'Invalid query parameters')
          : undefined,
        body: body
          ? parseWithHttpError(body, req.body, 'Invalid body')
          : undefined,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
