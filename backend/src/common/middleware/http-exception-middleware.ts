/**
 * Exception filter for HTTP errors.
 * Logs error details using Winston and sends structured JSON responses with correlation-id for traceability.
 */
import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * @param logger Winston logger instance for error reporting.
   */
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Handles HttpException by logging error details and responding with a structured error payload.
   * Includes correlation-id from request headers to facilitate tracing in distributed systems.
   *
   * @param exception The thrown HttpException instance
   * @param host The current arguments host, providing context like req/res
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const correlationId = req.headers['correlation-id'] || req.headers['x-correlation-id'] || undefined;

    this.logger.error(
      `[ERROR] ${req.method} ${req.url} ${status} - ${exception.message}`,
      {
        statusCode: status,
        correlationId,
        stack: exception.stack,
      },
    );

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      correlationId,
      error: exception.message,
    });
  }
}