import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'super-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export function generateToken(email: string, roles: string[]) {
  const payload = { email, roles };

  // força o tipo correto
  const signOptions: jwt.SignOptions = {
    expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, SECRET, signOptions);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
