import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
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
import { LoggingMiddleware } from './common/middleware/logging-middleware';

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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    // 1️⃣ CorrelationIdMiddleware — precisa excluir as rotas públicas
    consumer
      .apply(CorrelationIdMiddleware)
      .exclude(
        { path: 'auth/token', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
        { path: '', method: RequestMethod.ALL },
      )
      .forRoutes('*');

    // 2️⃣ Logging — agora sempre vai pegar o correlation correto
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');

    // 3️⃣ Content-type — por último
    consumer
      .apply(ContentTypeMiddleware)
      .forRoutes('*');
  }
}