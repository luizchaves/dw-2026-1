import { z } from 'zod';

import { HttpError } from '../errors/HttpError.js';

export const requiredTrimmedString = (message: string) =>
  z
    .unknown()
    .refine(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
      {
        message,
      }
    )
    .transform((value) => value.trim());

const getFirstIssueMessage = (error: z.ZodError, fallbackMessage: string) =>
  error.issues[0]?.message ?? fallbackMessage;

const parseWithHttpError = <T>(
  schema: z.ZodType<T>,
  input: unknown,
  fallbackMessage: string
) => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new HttpError(getFirstIssueMessage(result.error, fallbackMessage));
  }

  return result.data;
};

type ValidationSchemas = {
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
};

export const validateRequest = ({
  params,
  query,
  body,
}: ValidationSchemas = {}) => {
  return (req: any, res: any, next: any) => {
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
};
