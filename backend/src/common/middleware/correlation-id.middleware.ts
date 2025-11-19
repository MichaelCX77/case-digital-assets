/**
 * Middleware that enforces and validates the `correlation-id` header (UUID v4)
 * for tracking requests. If missing or invalid, logs the event and rejects 
 * the request with BadRequestException.
 */
import { Injectable, NestMiddleware, Inject, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { LoggerService } from '@nestjs/common';
import { getIsoDate } from '../utils/date.utils';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  /**
   * @param logger Logger service for structured logging (Winston).
   */
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * Validates the `correlation-id` header for each request.
   * Attaches it to the request object for downstream handling.
   * Logs and rejects requests missing a valid correlation-id.
   *
   * @param req Incoming Express request (with optional correlationId)
   * @param res Express response object
   * @param next Next middleware
   * @throws BadRequestException if correlation-id is missing or not UUID v4
   */
  use(req: Request & { correlationId?: string }, res: Response, next: NextFunction) {
    const correlationId = req.headers['correlation-id'] || req.headers['x-correlation-id'];
    const { method, originalUrl } = req;

    if (!correlationId || typeof correlationId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(correlationId)) {
      this.logger.log({
        level: 'info',
        message: `Invalid or missing correlation-id`,
        method,
        url: originalUrl,
        statusCode: 400,
        correlationId: undefined,
        timestamp: getIsoDate(),
      });

      throw new BadRequestException(
        'Invalid or missing header: correlation-id. Must be UUID v4.',
      );
    }

    req.correlationId = correlationId;

    next();
  }
}