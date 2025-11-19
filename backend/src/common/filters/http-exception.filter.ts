import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { getIsoDate } from '../utils/date.utils';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { transactionId?: string }>();
    const res = ctx.getResponse<Response>();

    // Contextual info
    const correlationId = req.headers['correlation-id'] || req.headers['x-correlation-id'] || undefined;
    const userId = (req.user as any)?.userId;
    const method = req.method;
    const url = req.url;
    const transactionId = req.transactionId ?? undefined;

    let statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : exception.status || 500;

    let code: string | undefined;
    let message: string;
    let detail: unknown = undefined;

    let responseBody = exception instanceof HttpException
      ? exception.getResponse()
      : { message: exception.message || 'Internal server error' };

    message = typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
      ? String((responseBody as any).message)
      : typeof responseBody === 'string'
        ? responseBody
        : "Internal server error";

    detail = typeof responseBody === 'object' && responseBody !== null && 'detail' in responseBody
      ? responseBody.detail
      : undefined;

    if (typeof message === "string") {
      message = message.replace(/"/g, "'");
    }

    // Padroniza saída do 4XX
    if (statusCode >= 400 && statusCode < 500) {
      if (!message || message === 'Internal server error') {
        message = 'Client error';
      }
      // Você pode customizar outros campos aqui, se quiser
    }

    // Força "Internal server error" para status 500
    if (statusCode === 500) {
      message = "Internal server error";
    }

    // Structured log, one per exception
    this.logger.log({
      correlationId: correlationId ?? "N/A",
      method: method ?? "N/A",
      transactionId: transactionId ?? "N/A",
      url: url ?? "N/A",
      userId: userId ?? "anonymous",
      level: "error",
      statusCode,
      message,
      timestamp: getIsoDate(),
      stack: exception?.stack,
      code,
      detail,
    });

    // Response for client
    const errorResponse: any = {
      message,
      timestamp: getIsoDate(),
    };
    if (code) errorResponse.code = code;
    if (detail && typeof detail === 'object') errorResponse.detail = detail;

    if (!res.headersSent) {
      res.status(statusCode).json(errorResponse);
    }
  }
}