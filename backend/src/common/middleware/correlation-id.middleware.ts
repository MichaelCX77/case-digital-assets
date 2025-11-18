import { Injectable, NestMiddleware, Inject, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { LoggerService } from '@nestjs/common';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  use(req: Request & { correlationId?: string }, res: Response, next: NextFunction) {
    const correlationId = req.headers['correlation-id'] || req.headers['x-correlation-id'];
    const { method, originalUrl } = req;

    if (!correlationId || typeof correlationId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(correlationId)) {
      
      // 🔥 LOG PADRONIZADO
      this.logger.log({
        level: 'info',
        message: `Invalid or missing correlation-id`,
        method,
        url: originalUrl,
        statusCode: 400,
        correlationId: undefined,
        timestamp: new Date().toISOString(),
      });

      // Continua lançando erro (mas o erro do Nest não será logado, o seu já foi)
      throw new BadRequestException(
        'Invalid or missing header: correlation-id. Must be UUID v4.',
      );
    }

    // ✓ Anexa no request
    req.correlationId = correlationId;

    next();
  }
}
