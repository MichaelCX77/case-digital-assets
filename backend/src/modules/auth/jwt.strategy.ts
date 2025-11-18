import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JwtStrategy provides JWT authentication mechanism for protected routes.
 * It extracts and validates tokens from Authorization headers,
 * and returns user information for use in request context.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.get<string>('JWT_SECRET') || 'super-secret',
      ignoreExpiration: false,
    });
  }

  /**
   * Validates token payload and injects it into request context.
   * @param payload The JWT payload.
   * @returns An object containing userId, email, and roles.
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}