import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'; // Token for global Winston logger
import { createWinstonLogger } from './common/logger/winston-logger';

/**
 * Entry point for Banking Management API.
 * - Sets up the global exception filter.
 * - Configures Swagger for API documentation.
 * - Uses Winston Logger for startup and operational logs (separated configuration).
 */
async function bootstrap() {
  // Create NestJS application with Winston logger (configured separately)
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Banking Management API')
    .setDescription('API documentation for the Case Digital Assets project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Acesse o logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  logger.log('Global HttpExceptionFilter applied');

  // Start the application and log startup info
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application started on port ${port}`);
  logger.log(`Swagger available at /api`);
}

bootstrap();