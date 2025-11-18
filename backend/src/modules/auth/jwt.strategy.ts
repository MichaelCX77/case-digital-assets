/**
 * JWT authentication strategy for protected routes.
 * Extracts and validates JWTs from Authorization headers,
 * and injects user data into the request context.
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes JWT authentication with options from ConfigService.
   * @param cfg ConfigService instance for application config.
   */
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.get<string>('JWT_SECRET') || 'super-secret',
      ignoreExpiration: false,
    });
  }

  /**
   * Validates decoded JWT payload and injects user info.
   * @param payload Decoded JWT payload
   * @returns Object including userId and roles for request context
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
      roles: payload.roles,
    };
  }
}