import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { AccountModule } from '../account/account.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

/**
 * TransactionModule
 * 
 * Module responsible for providing transaction-related controllers, services, and repositories.
 * Imports dependencies for database access and account management.
 */
@Module({
  imports: [PrismaModule, AccountModule, UserModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionRepository]
})
export class TransactionModule {}