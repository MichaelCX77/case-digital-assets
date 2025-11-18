/**
 * Main AppModule for the Banking Management API.
 * - Registers global middleware in correct order for request metadata and validation.
 * - Provides Winston structured logging and health check integration.
 * - Sets global authorization guard and logging interceptor.
 * - Modularizes user, account, role, transaction, and authentication features.
 */
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GatewayGuard } from './common/guards/gateway.guard';
import { UserModule } from './modules/user/user.module';
import { AccountModule } from './modules/account/account.module';
import { ContentTypeMiddleware } from './common/middleware/content-type.middleware';
import { AccountTypeModule } from './modules/account-type/account-type.module';
import { RoleModule } from './modules/role/role.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TerminusModule } from '@nestjs/terminus';
import { WinstonModule } from 'nest-winston';
import { createWinstonLogger } from './common/logger/winston-logger';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging-interceptor';
import { TransactionIdMiddleware } from './common/middleware/transaction-id.meddleware'; // corrigido: 'meddleware' -> 'middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    AccountModule,
    AccountTypeModule,
    RoleModule,
    TransactionModule,
    TerminusModule,
    WinstonModule.forRoot(createWinstonLogger()),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GatewayGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply TransactionId middleware globally to ensure transactionId is set for all requests.
    consumer
      .apply(TransactionIdMiddleware)
      .forRoutes('*');

    // Apply CorrelationId middleware, excluding public routes (token, health, root).
    consumer
      .apply(CorrelationIdMiddleware)
      .exclude(
        { path: 'auth/token', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
        { path: '', method: RequestMethod.ALL },
      )
      .forRoutes('*');

    // Always enforce content-type on mutating requests globally.
    consumer
      .apply(ContentTypeMiddleware)
      .forRoutes('*');
  }
}