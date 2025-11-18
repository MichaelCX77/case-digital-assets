import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async issueTokenByEmail(email: string, password: string) {
    const normalized = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { username: normalized },
      include: { roles: true },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    const payload = {
      sub: user.id,
      email: user.username,
      roles: user.roles.map(r => r.name),
    };

    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }
}
