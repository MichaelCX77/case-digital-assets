import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../transaction.repository';
import { AccountRepository } from '../../account/account.repository';
import type { WithdrawFlow } from '../interfaces/transaction-flow.interface';
import { getIsoDate } from 'src/common/utils/date.utils';

@Injectable()
export class WithdrawFlowService implements WithdrawFlow {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository
  ) {}

  async execute(dto: any, transactionId: string) {
    this.validateInput(dto);

    const account = await this.getAccountOrThrow(dto.sourceAccountId, 'Account not found');
    await this.assertOperationOwner(account, dto.operatorUserId);

    this.assertSufficientFunds(account, dto.amount);

    const transaction = await this.createWithdrawTransaction(account, dto, transactionId);
    await this.accountRepo.update(dto.sourceAccountId, { balance: transaction.balanceAfter });

    return transaction;
  }

  private validateInput(dto: any) {
    const requiredFields: [keyof typeof dto, string][] = [
      ['sourceAccountId', 'sourceAccountId is required for withdrawal'],
      ['operatorUserId', 'operatorUserId is required for withdrawal'],
    ];
    for (const [field, message] of requiredFields) {
      if (!dto[field]) throw new BadRequestException(message);
    }
  }

  private async getAccountOrThrow(accountId: string, message: string) {
    const account = await this.accountRepo.findById(accountId);
    if (!account) throw new NotFoundException(message);
    return account;
  }

  private async assertOperationOwner(account: any, operatorUserId: string) {
    const userAccounts = await this.accountRepo.listUsers(account.idAccount || account.id);
    const isOwner = userAccounts.some(ua => ua.user?.id === operatorUserId);
    if (!isOwner) throw new ForbiddenException('User is not owner of the account');
  }

  private assertSufficientFunds(account: any, amount: number) {
    if (account.balance < amount) {
      throw new BadRequestException({
        message: 'Insufficient funds',
        detail: { balance: account.balance }
      });
    }
  }

  private async createWithdrawTransaction(account: any, dto: any, transactionId: string) {
    const balanceAfter = account.balance - dto.amount;
    return this.transactionRepo.create({
      transactionId: transactionId,
      sourceAccountId: dto.sourceAccountId,
      destinationAccountId: null,
      type: dto.type,
      amount: dto.amount,
      balanceBefore: account.balance,
      balanceAfter,
      operatorUserId: dto.operatorUserId,
      timestamp: getIsoDate(),
      visibleToAccountId: dto.sourceAccountId,
    });
  }
}