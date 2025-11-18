/**
 * JWT utility functions for token generation and verification.
 * Uses environment variables for secret and expiration.
 */
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'super-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Generates a JWT token for a user.
 * @param userId User ID to embed in token payload.
 * @param roles Array of user roles for payload.
 * @returns Signed JWT token string.
 */
export function generateToken(userId: string, roles: string[]): string {
  const payload = { sub: userId, roles };
  const signOptions: jwt.SignOptions = {
    expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, SECRET, signOptions);
}

/**
 * Verifies and decodes a JWT token.
 * @param token JWT token string.
 * @returns Decoded token payload if valid.
 * @throws Error if the token is invalid or expired.
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    throw err;
  }
}