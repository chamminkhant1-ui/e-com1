import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

/**
 * Catch-all for unmatched routes. Forwards to the global error handler.
 * Response message is intentionally generic (path is logged server-side only).
 */
export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(AppError.notFound('The requested resource was not found.'));
};
