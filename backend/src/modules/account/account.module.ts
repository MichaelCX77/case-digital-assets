import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

/**
 * NestJS module that provides account domain features,
 * including service, repository, and controller integration.
 */
@Module({
  imports: [PrismaModule, UserModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountRepository] // Need to export AccountRepository for usage in other modules.
})
export class AccountModule {}