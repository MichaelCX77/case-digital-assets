import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../transaction.repository';
import { AccountRepository } from '../../account/account.repository';
import type { TransferFlow } from '../interfaces/transaction-flow.interface';
import { TransactionTypeEffective } from '../enums/transaction-type.enum';

/**
 * Service handling money transfers between accounts.
 * Implements the TransferFlow interface.
 * Encapsulates all validation and persistence logic for transfer operations.
 */
@Injectable()
export class TransferFlowService implements TransferFlow {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository
  ) {}

  /**
   * Orchestrates all steps for a transfer operation. 
   * Validates DTO, ownership, funds, processes out/in registry and balance update.
   * 
   * @param dto Transfer flow data transfer object
   * @param transactionId Shared transaction UUID for out/in
   * @returns The TRANSFER_OUT transaction registry
   * @throws BadRequestException, ForbiddenException, NotFoundException on invalid input or business rule violation
   */
  async execute(dto: any, transactionId: string) {
    this.validateInput(dto);

    const sourceAccount = await this.getAccountOrThrow(dto.sourceAccountId, 'Source account not found');
    await this.assertOperationOwner(sourceAccount, dto.operatorUserId);

    this.assertSufficientFunds(sourceAccount, dto.amount);

    const destAccount = await this.getAccountOrThrow(dto.destinationAccountId, 'Destination account not found');

    const transactionOut = await this.transferOut(sourceAccount, destAccount, dto, transactionId);
    await this.transferIn(destAccount, sourceAccount, dto, transactionId);

    return transactionOut;
  }

  /**
   * Validates required DTO fields for transfer.
   */
  private validateInput(dto: any) {
    const requiredFields: [keyof typeof dto, string][] = [
      ['sourceAccountId', 'sourceAccountId is required for transfer'],
      ['destinationAccountId', 'destinationAccountId is required for transfer'],
      ['operatorUserId', 'operatorUserId is required for transfer'],
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
   * Checks if user is an owner of the given account.
   */
  private async assertOperationOwner(account: any, operatorUserId: string) {
    const userAccounts = await this.accountRepo.listUsers(account.idAccount || account.id);
    const isOwner = userAccounts.some(ua => ua.user?.id === operatorUserId);
    if (!isOwner) throw new ForbiddenException('User is not owner of the source account');
  }

  /**
   * Checks sufficient funds for transfer.
   */
  private assertSufficientFunds(account: any, amount: number) {
    if (account.balance < amount) {
      throw new BadRequestException({
        message: 'Insufficient funds',
        detail: { balance: account.balance }
      });
    }
  }

  /**
   * Persists a TRANSFER_OUT registry and updates source balance.
   */
  private async transferOut(sourceAccount: any, destAccount: any, dto: any, transactionId: string) {
    const balanceAfterSource = sourceAccount.balance - dto.amount;
    await this.accountRepo.update(dto.sourceAccountId, { balance: balanceAfterSource });
    return this.transactionRepo.create({
      idTransaction: transactionId,
      sourceAccountId: dto.sourceAccountId,
      destinationAccountId: dto.destinationAccountId,
      type: TransactionTypeEffective.TRANSFER_OUT,
      amount: dto.amount,
      balanceBefore: sourceAccount.balance,
      balanceAfter: balanceAfterSource,
      operatorUserId: dto.operatorUserId,
      timestamp: new Date(),
      visibleToAccountId: dto.sourceAccountId,
    });
  }

  /**
   * Persists a TRANSFER_IN registry and updates destination balance.
   */
  private async transferIn(destAccount: any, sourceAccount: any, dto: any, transactionId: string) {
    const balanceAfterDest = destAccount.balance + dto.amount;
    await this.accountRepo.update(dto.destinationAccountId, { balance: balanceAfterDest });
    return this.transactionRepo.create({
      idTransaction: transactionId,
      sourceAccountId: dto.sourceAccountId,
      destinationAccountId: dto.destinationAccountId,
      type: TransactionTypeEffective.TRANSFER_IN,
      amount: dto.amount,
      balanceBefore: destAccount.balance,
      balanceAfter: balanceAfterDest,
      operatorUserId: dto.operatorUserId,
      timestamp: new Date(),
      visibleToAccountId: dto.destinationAccountId,
    });
  }
}