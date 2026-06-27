import { Request, Response, NextFunction } from 'express';
import { normalizeError, type NormalizedError } from '../utils/normalizeError';

const isProduction = process.env.NODE_ENV === 'production';

function logServerError(
  err: unknown,
  req: Request,
  normalized: NormalizedError
): void {
  const entry = {
    method: req.method,
    path: req.originalUrl,
    status: normalized.statusCode,
    message: normalized.message,
    operational: normalized.isOperational,
    ...(err instanceof Error && { stack: err.stack }),
  };

  if (normalized.statusCode >= 500) {
    console.error('[error]', entry);
    return;
  }

  // Skip logging expected 401s on session-check routes (e.g. GET /auth/me)
  const isExpectedAuthCheck =
    normalized.statusCode === 401 && req.method === 'GET' && /\/auth\/me$/i.test(req.originalUrl);

  if (!isProduction && !isExpectedAuthCheck) {
    console.warn('[error]', entry);
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (res.headersSent) {
    return;
  }

  const normalized = normalizeError(err);
  logServerError(err, req, normalized);

  const body: Record<string, unknown> = {
    ok: false,
    message: normalized.message,
  };

  if (normalized.errors) {
    body.errors = normalized.errors;
  }

  if (normalized.part) {
    body.part = normalized.part;
  }

  if (!isProduction && err instanceof Error && err.stack) {
    body.stack = err.stack;
  }

  res.status(normalized.statusCode).json(body);
};
