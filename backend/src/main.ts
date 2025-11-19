/**
 * Entry point for the Banking Management API.
 * - Applies global exception filter and logger.
 * - Enables CORS for cross-origin requests.
 * - Configures Swagger for API documentation.
 * - Applies global rate limiting middleware (configurable through environment variables).
 * - Applies global request validation using ValidationPipe.
 * - Uses Winston Logger for startup and operational logs.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { getIsoDate } from './common/utils/date.utils';

const RATE_LIMIT_WINDOW_MS =
  Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // default: 15 minutes
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 100; // default: 100 requests per window
const RATE_LIMIT_MESSAGE =
  process.env.RATE_LIMIT_MESSAGE ||
  'Too many requests from this IP, please try again later.';

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: RATE_LIMIT_MESSAGE,
});

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || true, // Allows all if not defined
    methods: process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  });

  // Apply global rate limiting
  app.use(limiter);

  // Apply global request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Banking Management API')
    .setDescription(
      process.env.SWAGGER_DESCRIPTION ||
        'API documentation for Case Digital Assets',
    )
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.SWAGGER_PATH || 'api', app, document);

  // Get Winston Logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  // Apply global exception filter, injecting Winston Logger
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  logger.log({
    level: 'info',
    message:
      'ValidationPipe, Global HttpExceptionFilter, rate limit middleware and CORS applied',
    timestamp: getIsoDate(),
  });

  // Start application and log startup
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log({
    level: 'info',
    message: `Application started on port ${port}`,
    timestamp: getIsoDate(),
  });

  logger.log({
    level: 'info',
    message: `Swagger available at /${process.env.SWAGGER_PATH || 'api'}`,
    timestamp: getIsoDate(),
  });
}

bootstrap();
