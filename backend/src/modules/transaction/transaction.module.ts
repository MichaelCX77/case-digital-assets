import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { AccountModule } from '../account/account.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';

// Novos Flows SOLID
import { DepositFlowService } from './services/deposit-flow.service';
import { WithdrawFlowService } from './services/withdraw-flow.service';
import { TransferFlowService } from './services/transfer-flow.service';

/**
 * TransactionModule
 * 
 * Module responsible for providing transaction-related controllers, services, and repositories.
 * Imports dependencies for database access and account management.
 * Fluxos segregados via SOLID para Deposit, Withdraw e Transfer.
 */
@Module({
  imports: [PrismaModule, AccountModule, UserModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionRepository,
    DepositFlowService,
    WithdrawFlowService,
    TransferFlowService,
    // SOLID: Providers para interfaces dos fluxos
    { provide: 'DepositFlow', useClass: DepositFlowService },
    { provide: 'WithdrawFlow', useClass: WithdrawFlowService },
    { provide: 'TransferFlow', useClass: TransferFlowService },
  ],
  exports: [TransactionService, TransactionRepository]
})
export class TransactionModule {}