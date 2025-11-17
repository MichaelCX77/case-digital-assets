import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch() // sem argumento pega TODOS os erros
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // HttpException ou outros erros
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;
    const message =
      exception instanceof HttpException
        ? exception.message
        : exception.message || 'Internal server error';

    response.status(status).json({
      message,
      time: new Date().toISOString(),
    });
  }
}