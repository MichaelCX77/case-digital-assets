import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client'; // Adicione para ter acesso ao tipo de erro do Prisma

@Catch() // sem argumento pega TODOS os erros
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Trata erro de Foreign Key do Prisma
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

    // HttpException ou outros erros
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;
    const message =
      exception instanceof HttpException
        ? exception.message
        : exception.message || 'Internal server error';

    if (!response.headersSent) {
      response.status(status).json({
        message,
        time: new Date().toISOString(),
      });
    }
    // Se os headers já foram enviados, não faz nada para evitar o erro headersSent
  }
}