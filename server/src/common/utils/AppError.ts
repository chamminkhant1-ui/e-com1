/**
 * Custom application error class for consistent error handling.
 * 
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw AppError.badRequest('Invalid email format');
 */

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory helpers for common HTTP errors
   */
  static badRequest(message = 'Bad Request') {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Not Found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }

  static internal(message = 'Internal Server Error') {
    return new AppError(message, 500);
  }
}

export default AppError;
