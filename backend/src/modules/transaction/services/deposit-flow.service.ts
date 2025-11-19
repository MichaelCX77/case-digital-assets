import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionRepository } from '../transaction.repository';
import { AccountRepository } from '../../account/account.repository';
import type { DepositFlow } from '../interfaces/transaction-flow.interface';
import { getIsoDate } from 'src/common/utils/date.utils';

/**
 * Service handling deposit operations into an account.
 * Implements the DepositFlow interface.
 * Encapsulates input validation, registry, and balance update for deposits.
 */
@Injectable()
export class DepositFlowService implements DepositFlow {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository
  ) {}

  /**
   * Main deposit orchestrator.
   * Validates DTO and destination account. Persists registry and updates balance.
   * 
   * @param dto Deposit flow DTO
   * @param transactionId Deposit transaction UUID
   * @returns The deposit transaction registry
   * @throws BadRequestException, NotFoundException on invalid input or account
   */
  async execute(dto: any, transactionId: string) {
    this.validateInput(dto);

    const account = await this.getAccountOrThrow(dto.destinationAccountId, 'Destination account not found');

    const transaction = await this.createDepositTransaction(account, dto, transactionId);
    await this.accountRepo.update(account.idAccount, { balance: transaction.balanceAfter });

    return transaction;
  }

  /**
   * Validates required DTO field for deposit.
   */
  private validateInput(dto: any) {
    const requiredFields: [keyof typeof dto, string][] = [
      ['destinationAccountId', 'destinationAccountId is required for deposit']
    ];
    for (const [field, message] of requiredFields) {
      if (!dto[field]) throw new BadRequestException(message);
    }
  }

  /**
   * Fetches account by ID and throws if not found.
   */
  private async getAccountOrThrow(accountId: string, message: string) {
    const account = await this.accountRepo.findById(accountId);
    if (!account) throw new NotFoundException(message);
    return account;
  }

  /**
   * Persists deposit registry.
   */
  private async createDepositTransaction(account: any, dto: any, transactionId: string) {
    const balanceAfter = account.balance + dto.amount;
    return this.transactionRepo.create({
      transactionId: transactionId,
      sourceAccountId: null,
      destinationAccountId: account.idAccount,
      type: dto.type,
      amount: dto.amount,
      balanceBefore: account.balance,
      balanceAfter,
      operatorUserId: dto.operatorUserId ?? null,
      timestamp: getIsoDate(),
      visibleToAccountId: account.idAccount,
    });
  }
}