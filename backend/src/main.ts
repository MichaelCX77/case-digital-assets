import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Entry point for Banking Management API.
 * - Sets up global exception filter.
 * - Configures Swagger for API documentation.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Banking Management API')
    .setDescription('API documentation for the Case Digital Assets project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger at /api endpoint
  SwaggerModule.setup('api', app, document);

  // Global exception handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Start application
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();