/**
 * Exception filter for HTTP errors that logs request details and responds
 * with structured error information. Logs errors with Winston and replaces
 * double quotes in messages with single quotes for consistency.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  /**
   * @param logger Winston logger instance for error logging.
   */
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Handles HttpExceptions by logging error details and 
   * sending a structured JSON response.
   *
   * @param exception Thrown HttpException instance
   * @param host Current execution context
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const correlationId = req.headers['correlation-id'] || req.headers['x-correlation-id'];

    // Replace double quotes with single quotes in the error message
    const customMessage = exception.message.replace(/"/g, "'");

    this.logger.error(
      `[ERROR] ${req.method} ${req.url} ${status} - ${customMessage}`,
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
      error: customMessage,
    });
  }
}