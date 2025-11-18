import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['correlation-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      undefined;

    const { method, originalUrl } = req;
    const start = Date.now();

    // IN (sem message)
    this.logger.log({
      type: 'IN',
      correlationId,
      method,
      url: originalUrl,
      timestamp: new Date().toISOString(),
    });

    const originalSend = res.send.bind(res);

    res.send = (body: any) => {
      const elapsed = Date.now() - start;

      let parsedMessage: string | undefined = undefined;

      // Se a resposta tiver um "message", captura
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        parsedMessage = parsed?.message;
      } catch {
        // body não é JSON — ignora
      }

      // OUT
      this.logger.log({
        type: 'OUT',
        message: parsedMessage, // pode ser undefined
        correlationId,
        method,
        url: originalUrl,
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        elapsed,
      });

      return originalSend(body);
    };

    next();
  }
}
