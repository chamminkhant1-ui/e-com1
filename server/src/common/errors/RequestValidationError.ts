import { ZodError } from 'zod';

export type ValidationPart = 'body' | 'params' | 'query';

/** Matches the client `ApiError.errors` shape (Zod flatten output). */
export type FlattenedValidationErrors = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

/**
 * Operational error for request validation failures.
 * Handled centrally by normalizeError / errorHandler.
 */
export class RequestValidationError extends Error {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(
    public readonly errors: FlattenedValidationErrors,
    public readonly part: ValidationPart,
  ) {
    super('Validation failed');
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static fromZod(
    error: ZodError,
    part: ValidationPart,
  ): RequestValidationError {
    return new RequestValidationError(error.flatten(), part);
  }
}
