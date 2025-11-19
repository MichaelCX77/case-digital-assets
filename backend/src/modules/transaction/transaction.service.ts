import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from '../account/account.repository';
import { UserRepository } from '../user/user.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionTypeOptions } from './enums/transaction-type.enum';
import type { DepositFlow, WithdrawFlow, TransferFlow } from './interfaces/transaction-flow.interface';
import { randomUUID } from 'crypto';

/**
 * TransactionService is the main orchestrator for all business logic related to transactions.
 * It follows the SOLID principles by delegating each flow (deposit, withdraw, transfer) to a dedicated service,
 * thus making the process more maintainable, testable and extensible.
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
   * Returns all transactions or filters by visibleToAccountId if an accountId is provided.
   * @param accountId Optional account ID for filtering visible transactions.
   * @returns Array of transactions.
   * @throws NotFoundException if the provided account is not found.
   */
  async getTransactions(accountId?: string) {
    if (!accountId) return this.transactionRepo.findAll();

    const account = await this.accountRepo.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');
    return this.transactionRepo.findByVisibleToAccountId(accountId);
  }

  /**
   * Retrieves a specific transaction given the transaction UUID and type.
   * @param idTransaction The transaction UUID.
   * @param type The transaction type.
   * @returns The transaction if found.
   * @throws NotFoundException if the transaction does not exist.
   */
  async getTransactionByIdAndType(idTransaction: string, type: string) {
    const transaction = await this.transactionRepo.findByIdAndType(idTransaction, type);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  /**
   * Validates required properties before processing the request for creation.
   * Elegantly reduces repetitive validation with a single loop.
   * @param dto Transaction details DTO.
   * @throws BadRequestException if validation fails.
   */
  private validateTransactionCreation(dto: CreateTransactionDto) {
    const requiredFields: [keyof CreateTransactionDto, string][] = [
      ['type', 'Type is required'],
      ['amount', 'Amount is required'],
    ];
    for (const [field, message] of requiredFields) {
      if (!dto[field]) throw new BadRequestException(message);
    }
    if (dto.amount <= 0) throw new BadRequestException('Amount must be positive');
  }

  /**
   * Validates existence of operator user if operatorUserId is present.
   * @param operatorUserId UUID of the operator user.
   * @throws NotFoundException if operator user is not found.
   */
  private async validateOperatorUser(operatorUserId?: string) {
    if (!operatorUserId) return;
    const user = await this.userRepo.findById(operatorUserId);
    if (!user) throw new NotFoundException('Operator user not found');
  }

  /**
   * Orchestrates the creation of a transaction, delegating the workflow to
   * the respective flow service in an extensible and maintainable way.
   * @param dto Transaction creation DTO.
   * @param idTransaction Optional UUID for the transaction.
   * @returns The created transaction.
   * @throws BadRequestException if transaction type is not supported.
   */
  async createTransaction(dto: CreateTransactionDto, idTransaction?: string) {
    const transactionId = idTransaction ?? randomUUID();

    this.validateTransactionCreation(dto);
    await this.validateOperatorUser(dto.operatorUserId);

    const flowMap: Record<string, (dto: any, id: string) => Promise<any>> = {
      [TransactionTypeOptions.TRANSFER]: this.transferFlow.execute.bind(this.transferFlow),
      [TransactionTypeOptions.WITHDRAW]: this.withdrawFlow.execute.bind(this.withdrawFlow),
      [TransactionTypeOptions.DEPOSIT]: this.depositFlow.execute.bind(this.depositFlow),
    };

    const flowHandler = flowMap[dto.type];
    if (!flowHandler) throw new BadRequestException('Unsupported transaction type');
    return flowHandler(dto, transactionId);
  }
}