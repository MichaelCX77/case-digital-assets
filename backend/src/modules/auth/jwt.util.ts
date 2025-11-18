import jwt from 'jsonwebtoken';

/**
 * Utility functions for JWT token generation and verification.
 */

const SECRET = process.env.JWT_SECRET || 'super-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Generates a JWT token with user_id and roles in the payload.
 * @param userId The user's id to include in the token payload.
 * @param roles Array of user roles to include in the token payload.
 * @returns A signed JWT token string.
 */
export function generateToken(userId: string, roles: string[]): string {
  const payload = { sub: userId, roles };
  const signOptions: jwt.SignOptions = {
    expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, SECRET, signOptions);
}

/**
 * Verifies a JWT token and returns its decoded payload.
 * @param token JWT token string to verify.
 * @returns Decoded token payload if valid.
 * @throws Error if verification fails.
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) { 
    throw err;
  }
}