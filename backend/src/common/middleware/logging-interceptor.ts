/**
 * Interceptor for structured logging of incoming and outgoing HTTP requests.
 * Logs request details including method, URL, correlationId, transactionId, userId, and latency.
 * Uses Winston for logging. IN logs before handling, OUT logs after response is sent.
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * @param logger Logger service (Winston) for logging request data.
   */
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * Intercepts and logs each request (IN) and response (OUT) with correlation, transaction, timing and user info.
   * @param context NestJS execution context
   * @param next Next call handler in pipeline
   * @returns Observable with tap for logging after response
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const correlationId =
      (req.headers['correlation-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      undefined;
    const { method, originalUrl } = req;
    const userId = (req.user as any)?.userId;
    const start = Date.now();
    const transactionId = req.transactionId;

    // Log request entry (IN)
    this.logger.log({
      type: 'IN',
      correlationId,
      transactionId,
      method,
      url: originalUrl,
      timestamp: new Date().toISOString(),
      userId,
    });

    // Log response exit (OUT)
    return next.handle().pipe(
      tap((data) => {
        const elapsed = Date.now() - start;

        let parsedMessage: string | undefined = undefined;
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          parsedMessage = parsed?.message;
        } catch {
          // non-JSON response, ignore
        }

        this.logger.log({
          type: 'OUT',
          message: parsedMessage,
          correlationId,
          method,
          url: originalUrl,
          timestamp: new Date().toISOString(),
          statusCode: context.switchToHttp().getResponse().statusCode,
          elapsed,
          userId,
        });
      }),
    );
  }
}