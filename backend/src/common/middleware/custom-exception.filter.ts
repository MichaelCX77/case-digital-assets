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
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const correlationId = req.headers['correlation-id'] || req.headers['x-correlation-id'];
    // substitui aspas duplas no message por aspas simples
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