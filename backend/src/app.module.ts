import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { GatewayGuard } from './guards/gateway.guard';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { ContentTypeMiddleware } from './common/middleware/content-type.middleware';
import { AccountTypeModule } from './account-type/account-type.module';
import { RoleModule } from './role/role.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    AccountModule,
    AccountTypeModule,
    RoleModule,
    TransactionModule
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
    consumer
      .apply(ContentTypeMiddleware)
      .forRoutes('*');
  }
}