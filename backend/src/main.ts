/**
 * Entry point for Banking Management API.
 * - Sets up global exception filter and logger.
 * - Configures Swagger for API documentation.
 * - Applies global rate limiting middleware (configurable via environment variables).
 * - Uses Winston Logger for startup and operational logs.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { createWinstonLogger } from './common/logger/winston-logger';
import rateLimit from 'express-rate-limit';

// Rate limit configuration via environment variables
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // default: 15 minutes
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 100; // default: 100 requests per window
const RATE_LIMIT_MESSAGE = process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.';

// Global rate limit middleware
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: RATE_LIMIT_MESSAGE,
});

async function bootstrap() {
  // Create NestJS application with Winston logger (configured separately)
  const app = await NestFactory.create(AppModule);

  // Apply global rate limiting
  app.use(limiter);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Banking Management API')
    .setDescription(process.env.SWAGGER_DESCRIPTION || 'API documentation for the Case Digital Assets project')
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.SWAGGER_PATH || 'api', app, document);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Get the Winston logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  logger.log('Global HttpExceptionFilter and RateLimit middleware applied');

  // Start the application and log startup info
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application started on port ${port}`);
  logger.log(`Swagger available at /${process.env.SWAGGER_PATH || 'api'}`);
}

bootstrap();