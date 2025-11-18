/**
 * Handles exceptions globally for HTTP and Prisma errors, 
 * providing structured API error responses. Prisma foreign key 
 * constraint errors (code P2003) get special handling with a 
 * user-friendly message.
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Transforms thrown exceptions into standardized error responses.
   * @param exception Error object thrown during request handling
   * @param host Execution context with HTTP request-response objects
   */
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Handle Prisma foreign key errors (code P2003)
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2003'
    ) {
      return response.status(400).json({
        message: "Invalid reference: Provided data doesn't exist in related records (e.g. roleId).",
        code: exception.code,
        time: new Date().toISOString(),
      });
    }

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    let responseBody = exception instanceof HttpException
      ? exception.getResponse()
      : { message: exception.message || 'Internal server error' };

    let message = typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
      ? responseBody.message
      : typeof responseBody === 'string'
        ? responseBody
        : "Internal server error";

    let detail = typeof responseBody === 'object' && responseBody !== null && 'detail' in responseBody
      ? responseBody.detail
      : undefined;

    // Normalize quotes in error messages
    if (typeof message === "string") {
      message = message.replace(/"/g, "'");
    }

    const baseResponse: any = {
      message,
      time: new Date().toISOString(),
    };

    if (detail && typeof detail === 'object') {
      baseResponse.detail = detail;
    }

    if (!response.headersSent) {
      response.status(status).json(baseResponse);
    }
  }
}