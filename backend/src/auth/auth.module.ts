import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

/**
 * Module for authentication: handles JWT configuration, strategies, and controllers.
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const expiresIn = Number(cfg.get<string>('JWT_EXPIRES_IN')) || 3600; // seconds
        return {
          secret: cfg.get<string>('JWT_SECRET') || 'dev-secret',
          signOptions: {
            expiresIn, // now as number (seconds)
            issuer: cfg.get<string>('JWT_ISSUER') || 'my-api',
            audience: cfg.get<string>('JWT_AUDIENCE') || 'my-clients',
            algorithm: 'HS256',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}