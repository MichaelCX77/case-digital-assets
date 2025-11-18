import jwt from 'jsonwebtoken';

/**
 * Utility functions for JWT token generation and verification.
 */

const SECRET = process.env.JWT_SECRET || 'super-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Generates a JWT token with email and roles in the payload.
 * @param email The user's email to include in the token payload.
 * @param roles Array of user roles to include in the token payload.
 * @returns A signed JWT token string.
 */
export function generateToken(email: string, roles: string[]): string {
  const payload = { email, roles };
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