import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { RequestValidationError } from '../errors/RequestValidationError';

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export const validate =
  (schemas: RequestSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success) {
          return next(RequestValidationError.fromZod(parsed.error, 'body'));
        }
        (req as { validatedBody?: unknown }).validatedBody = parsed.data;
      }

      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) {
          return next(RequestValidationError.fromZod(parsed.error, 'params'));
        }
        (req as { validatedParams?: unknown }).validatedParams = parsed.data;
      }

      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) {
          return next(RequestValidationError.fromZod(parsed.error, 'query'));
        }
        (req as { validatedQuery?: unknown }).validatedQuery = parsed.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
