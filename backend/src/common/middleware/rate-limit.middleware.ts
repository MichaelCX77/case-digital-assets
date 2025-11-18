/**
 * Applies rate limiting to incoming HTTP requests using express-rate-limit.
 * Limits number of requests from a single IP within a configurable time window.
 * Configuration is set via environment variables:
 *   - RATE_LIMIT_WINDOW_MS: duration of window in milliseconds (default: 15 minutes)
 *   - RATE_LIMIT_MAX: max requests per IP per window (default: 100)
 *   - RATE_LIMIT_MESSAGE: message returned when limit exceeded
 * 
 * Example usage (in AppModule):
 *   consumer.apply(RateLimitMiddleware).forRoutes('*');
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.',
});

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  /**
   * Applies the rate limit to incoming requests.
   * @param req Incoming Express request
   * @param res Express response object
   * @param next Next middleware function
   */
  use(req: Request, res: Response, next: NextFunction) {
    return limiter(req, res, next);
  }
}