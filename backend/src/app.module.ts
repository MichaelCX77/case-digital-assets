import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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

/**
 * Main application module.
 * Registers global config, core modules, controllers, guards, and middleware.
 */
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
  /**
   * Configure custom middleware (ContentTypeMiddleware for all routes).
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ContentTypeMiddleware)
      .forRoutes('*');
  }
}