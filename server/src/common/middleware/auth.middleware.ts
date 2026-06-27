import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/AppError';
import {
  verifyToken,
  AuthTokenPayload,
  JWT_COOKIE_NAME,
} from '../utils/jwt.utils';
import { AuthService } from '../../modules/auth/auth.service';
import { Role } from '../../database/entities/Account';

const authService = new AuthService();

/**
 * Middleware to protect routes by verifying the JWT from the cookie.
 * If successful, attaches the decoded user payload to req.user.
 */
export const verifyAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get token from cookie
    const token = req.cookies?.[JWT_COOKIE_NAME];

    if (!token) {
      // No token found in the cookie
      throw AppError.unauthorized('Authentication token not found.');
    }

    // 2. Verify token
    let decoded: AuthTokenPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      // Token is invalid (expired, manipulated, etc.)
      throw AppError.unauthorized('Invalid or expired authentication token.');
    }

    // 3. Check if user still exists in DB (optional but recommended for security)
    const account = await authService.findOne(decoded.id);

    if (!account) {
      // User deleted but token is still valid
      throw AppError.unauthorized(
        'User belonging to this token no longer exists.'
      );
    }

    // 4. Check tokenVersion
    // If the user has incremented tokenVersion, old tokens become invalid
    if (
      typeof decoded.tokenVersion !== 'number' ||
      decoded.tokenVersion !== account.tokenVersion
    ) {
      throw AppError.unauthorized(
        'Token has been invalidated. Please login again.'
      );
    }

    // 5. Attach user data to the request object for downstream use
    (req as any).user = {
      role: account.role,
      ...decoded,
    };

    next();
  }
);

/**
 * Middleware to restrict access to specific roles.
 * Usage: ‌allowTo("admin", "super")
 */
export const allowTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      throw AppError.forbidden(
        'You do not have permission to perform this action.'
      );
    }

    next();
  };
};
