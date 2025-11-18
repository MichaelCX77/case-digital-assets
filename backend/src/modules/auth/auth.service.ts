import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { generateToken } from './jwt.util';

/**
 * Service responsible for authentication logic and JWT token issuing.
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Issues a JWT token using user email and password.
   * @param email User email for authentication.
   * @param password User password.
   * @returns An object containing the access_token (JWT).
   * @throws UnauthorizedException if email or password is invalid.
   */
  async issueTokenByEmail(email: string, password: string): Promise<{ access_token: string }> {
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

    // Set roles in the token payload
    const roles = user.role ? [user.role.name] : [];

    const access_token = generateToken(user.email, roles);

    return { access_token };
  }
}