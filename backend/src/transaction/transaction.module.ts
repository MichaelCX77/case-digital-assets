import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { AccountModule } from 'src/account/account.module';
import { PrismaModule } from 'src/prisma/prisma.module';

/**
 * TransactionModule
 * 
 * Module responsible for providing transaction-related controllers, services, and repositories.
 * Imports dependencies for database access and account management.
 */
@Module({
  imports: [PrismaModule, AccountModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService]
})
export class TransactionModule {}