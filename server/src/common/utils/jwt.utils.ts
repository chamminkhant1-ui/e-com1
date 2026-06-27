import jwt from 'jsonwebtoken';
import { Account } from '../../database/entities/Account';
import AppError from './AppError';

// Define the JWT Payload structure
export interface AuthTokenPayload {
  id: number;
  tokenVersion: number;
}

// NOTE: In a real app, this secret should be loaded from environment variables (e.g., process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_COOKIE_NAME = 'jwt';

/**
 * Creates and signs a JSON Web Token (JWT) for the authenticated account.
 * @param account The account entity to use for the payload.
 * @returns The signed JWT string.
 */
export const signToken = (account: Account): string => {
  const payload: AuthTokenPayload = {
    id: account.id,
    tokenVersion: account.tokenVersion,
  };

  // Token expires in 7 days for persistent login
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Verifies a JWT and extracts the payload.
 * @param token The JWT string to verify.
 * @returns The decoded payload if verification is successful.
 * @throws AppError if the token is invalid or expired.
 */
export const verifyToken = (token: string): AuthTokenPayload => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return payload;
  } catch (err) {
    // Catch specific JWT errors and wrap them in a 401 AppError
    if (err instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Invalid token or token expired.');
    }
    throw AppError.unauthorized('Authentication failed.');
  }
};

export { JWT_COOKIE_NAME, JWT_SECRET };
