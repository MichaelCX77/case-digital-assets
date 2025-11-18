/**
 * Enforces and validates the `correlation-id` header (UUID v4) 
 * for request tracking. If the header is missing or invalid, 
 * logs the event and responds with a BadRequest error.
 */

import { Injectable, NestMiddleware, Inject, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { LoggerService } from '@nestjs/common';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  /**
   * @param logger Winston-based logger for structured logging.
   */
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * Validates the presence and format of a `correlation-id` header. 
   * Sets it on the request object for downstream processing. 
   * Logs any invalid or missing header and throws an error.
   * 
   * @param req Express request object (with optional correlationId)
   * @param res Express response object
   * @param next Next middleware function
   * @throws {BadRequestException} If header is missing or not UUID v4.
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
        timestamp: new Date().toISOString(),
      });

      throw new BadRequestException(
        'Invalid or missing header: correlation-id. Must be UUID v4.',
      );
    }

    req.correlationId = correlationId;

    next();
  }
}