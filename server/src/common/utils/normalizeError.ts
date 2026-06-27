import { ZodError } from 'zod';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import jwt from 'jsonwebtoken';
import AppError from './AppError';
import { RequestValidationError } from '../errors/RequestValidationError';

export type ApiErrorBody = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

export type NormalizedError = {
  statusCode: number;
  message: string;
  errors?: ApiErrorBody;
  part?: string;
  isOperational: boolean;
};

const isProduction = process.env.NODE_ENV === 'production';

const GENERIC_INTERNAL_MESSAGE = 'Internal Server Error';

function postgresCode(error: QueryFailedError): string | undefined {
  const driver = error.driverError as { code?: string } | undefined;
  return driver?.code;
}

function isJsonParseError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) return false;

  const withStatus = err as SyntaxError & { status?: number; type?: string };
  if (withStatus.status === 400) return true;
  if (withStatus.type === 'entity.parse.failed') return true;

  return /json/i.test(err.message);
}

function isEntityParseFailed(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: string }).type === 'entity.parse.failed'
  );
}

/**
 * Maps any thrown value to a safe, client-facing error shape.
 * Never forwards raw database or driver messages in production.
 */
export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof RequestValidationError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      part: err.part,
      isOperational: true,
    };
  }

  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      isOperational: err.isOperational,
    };
  }

  if (err instanceof ZodError) {
    const flattened = err.flatten();
    return {
      statusCode: 400,
      message: 'Validation failed',
      errors: flattened,
      isOperational: true,
    };
  }

  if (err instanceof QueryFailedError) {
    const code = postgresCode(err);

    if (code === '23505') {
      return {
        statusCode: 409,
        message: 'A record with this value already exists.',
        isOperational: true,
      };
    }

    if (code === '23503') {
      return {
        statusCode: 400,
        message: 'Related record does not exist.',
        isOperational: true,
      };
    }

    return {
      statusCode: 500,
      message: isProduction ? GENERIC_INTERNAL_MESSAGE : err.message,
      isOperational: false,
    };
  }

  if (err instanceof EntityNotFoundError) {
    return {
      statusCode: 404,
      message: 'Resource not found.',
      isOperational: true,
    };
  }

  if (isJsonParseError(err) || isEntityParseFailed(err)) {
    return {
      statusCode: 400,
      message: 'Invalid JSON in request body.',
      isOperational: true,
    };
  }

  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    return {
      statusCode: 401,
      message: 'Invalid or expired authentication token.',
      isOperational: true,
    };
  }

  if (err instanceof Error) {
    return {
      statusCode: 500,
      message: isProduction
        ? GENERIC_INTERNAL_MESSAGE
        : err.message || GENERIC_INTERNAL_MESSAGE,
      isOperational: false,
    };
  }

  return {
    statusCode: 500,
    message: GENERIC_INTERNAL_MESSAGE,
    isOperational: false,
  };
}
