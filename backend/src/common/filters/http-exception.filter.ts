import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Global filter to handle HTTP and Prisma exceptions gracefully,
 * returning structured error objects in API responses.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Prisma FK error
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2003'
    ) {
      return response.status(400).json({
        message: "Invalid reference: The provided data does not exist in related records (e.g. roleId).",
        code: exception.code,
        time: new Date().toISOString(),
      });
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    let responseBody = exception instanceof HttpException
      ? exception.getResponse()
      : { message: exception.message || 'Internal server error' };

    let message = (typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody)
      ? responseBody.message
      : typeof responseBody === 'string'
        ? responseBody
        : "Internal server error";

    let detail = (typeof responseBody === 'object' && responseBody !== null && 'detail' in responseBody)
      ? responseBody.detail
      : undefined;

    // --------- TROCA ASPAS DUPLAS POR SIMPLES NA MENSAGEM -----------
    if (typeof message === "string") {
      message = message.replace(/"/g, "'");
    }

    const baseResponse: any = {
      message,
      time: new Date().toISOString()
    };

    if (detail && typeof detail === 'object' && detail !== null) {
      baseResponse.detail = detail;
    }

    if (!response.headersSent) {
      response.status(status).json(baseResponse);
    }
  }
}