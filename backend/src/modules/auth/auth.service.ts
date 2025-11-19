import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { generateToken } from './jwt.util';

/**
 * Provides authentication logic:
 * Validates user credentials, issues JWT access tokens, and
 * throws exceptions for invalid authentication attempts.
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Authenticates a user by email and password and issues a JWT token.
   * @param email Email address to authenticate.
   * @param password User password.
   * @returns JWT token string.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async issueTokenByEmail(email: string, password: string): Promise<string> {
    const normalized = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Include roles in token payload
    const roles = user.role ? [user.role.name] : [];
    return generateToken(user.id, roles);
  }
}