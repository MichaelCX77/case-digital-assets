import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { generateToken } from './jwt.util';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async issueTokenByEmail(email: string, password: string) {
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

    // Define roles no payload do token
    const roles = user.role ? [user.role.name] : [];

    const access_token = generateToken(user.email, roles);

    return { access_token };
  }
}
