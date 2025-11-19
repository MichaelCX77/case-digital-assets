import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from '../account/account.repository';
import { UserRepository } from '../user/user.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionTypeOptions } from './enums/transaction-type.enum';
import type { DepositFlow, WithdrawFlow, TransferFlow } from './interfaces/transaction-flow.interface';
import { randomUUID } from 'crypto';

/**
 * Central orchestrator for transaction business logic (SOLID).
 * Each flow is handled by its dedicated service.
 */
@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository,
    private readonly userRepo: UserRepository,

    @Inject('DepositFlow')
    private readonly depositFlow: DepositFlow,

    @Inject('WithdrawFlow')
    private readonly withdrawFlow: WithdrawFlow,

    @Inject('TransferFlow')
    private readonly transferFlow: TransferFlow,
  ) {}

  /**
   * List transactions filtered by visibleToAccountId if accountId provided,
   * otherwise all transactions are listed.
   * @param accountId Optional account ID for filtering which transactions are visible to the account.
   * @returns Array of transactions.
   */
  async getTransactions(accountId?: string) {
    if (accountId) {
      const account = await this.accountRepo.findById(accountId);
      if (!account) throw new NotFoundException('Account not found');
      return this.transactionRepo.findByVisibleToAccountId(accountId);
    }
    return this.transactionRepo.findAll();
  }

  /**
   * Get a specific transaction by idTransaction and type.
   */
  async getTransactionByIdAndType(idTransaction: string, type: string) {
    const transaction = await this.transactionRepo.findByIdAndType(idTransaction, type);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  /**
   * Orchestrates creation of a transaction via the correct flow service.
   * @param dto Transaction details.
   * @param idTransaction Optional UUID. If not provided, generated automatically.
   * @returns The created transaction (see business rules for TRANSFER).
   */
  async createTransaction(dto: CreateTransactionDto, idTransaction?: string) {
    const transactionId = idTransaction ?? randomUUID();

    if (!dto.type || !dto.amount)
      throw new BadRequestException('Type and amount are required');
    if (dto.amount <= 0)
      throw new BadRequestException('Amount must be positive');

    // Validate operator user if provided
    if (dto.operatorUserId) {
      const user = await this.userRepo.findById(dto.operatorUserId);
      if (!user) throw new NotFoundException('Operator user not found');
    }

    switch (dto.type) {
      case TransactionTypeOptions.TRANSFER:
        return this.transferFlow.execute(dto, transactionId);
      case TransactionTypeOptions.WITHDRAW:
        return this.withdrawFlow.execute(dto, transactionId);
      case TransactionTypeOptions.DEPOSIT:
        return this.depositFlow.execute(dto, transactionId);
      default:
        throw new BadRequestException('Unsupported transaction type');
    }
  }
}