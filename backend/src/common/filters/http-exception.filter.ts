import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
        message: 'Referência inválida: o dado informado não existe nos registros relacionados (ex: roleId).',
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

    // Extrai message e detail, mantendo detail sempre como objeto ou undefined
    let message = (typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody)
      ? responseBody.message
      : typeof responseBody === 'string'
        ? responseBody
        : 'Internal server error';

    let detail = (typeof responseBody === 'object' && responseBody !== null && 'detail' in responseBody)
      ? responseBody.detail
      : undefined;

    const baseResponse: any = {
      message,
      time: new Date().toISOString()
    };

    // Só adiciona detail se existe e é objeto (mantém agrupado)
    if (detail && typeof detail === 'object' && detail !== null) {
      baseResponse.detail = detail;
    }

    if (!response.headersSent) {
      response.status(status).json(baseResponse);
    }
  }
}