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
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const correlationId =
      (req.headers['correlation-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      undefined;
    const { method, originalUrl } = req;
    const userId = (req.user as any)?.userId; // req.user.userId está correto após seu Guard
    const start = Date.now();
    const transactionId = req.transactionId;

    this.logger.log({
      type: 'IN',
      correlationId,
      transactionId,
      method,
      url: originalUrl,
      timestamp: new Date().toISOString(),
      userId,
    });

    return next.handle().pipe(
      tap((data) => {
        const elapsed = Date.now() - start;

        let parsedMessage: string | undefined = undefined;
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          parsedMessage = parsed?.message;
        } catch {
          // ignora se não for JSON
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