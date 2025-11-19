/**
 * Handles exceptions globally for HTTP and Prisma errors,
 * providing structured API error responses and logging each exception once
 * with Winston using the established log format.
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // Tipo extendido para acessar .transactionId do middleware
    const req = ctx.getRequest<Request & { transactionId?: string }>();
    const res = ctx.getResponse<Response>();

    // Contextual info: busca primeiro de req.transactionId, depois do header
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

    // Prisma P2003 (FK constraint) treatment
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2003'
    ) {
      const field = exception?.meta?.field_name;
      const model = exception?.meta?.model;
      message = field && model
        ? `O valor informado para '${field}' não existe na tabela '${model}'.`
        : field
          ? `O valor informado para '${field}' é inválido ou não faz referência a um registro existente.`
          : "Foi enviado um dado relacionado inválido. Verifique se os IDs enviados realmente existem.";
      code = exception.code;
    } else {
      // Other HTTP/unexpected errors
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
    }

    // Force "Internal server error" for status 500
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
      timestamp: new Date().toISOString(),
      stack: exception?.stack,
      code,
      detail,
    });

    // Response for client
    const errorResponse: any = {
      message,
      timestamp: new Date().toISOString(),
    };
    if (code) errorResponse.code = code;
    if (detail && typeof detail === 'object') errorResponse.detail = detail;

    if (!res.headersSent) {
      res.status(statusCode).json(errorResponse);
    }
  }
}