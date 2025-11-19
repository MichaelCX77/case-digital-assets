import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../transaction.repository';
import { AccountRepository } from '../../account/account.repository';
import { DepositFlow } from '../interfaces/transaction-flow.interface';

@Injectable()
export class DepositFlowService implements DepositFlow {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository
  ) {}

  async execute(dto: any, transactionId: string) {
    if (!dto.destinationAccountId)
      throw new NotFoundException('destinationAccountId is required for deposit');

    const account = await this.accountRepo.findById(dto.destinationAccountId);
    if (!account) throw new NotFoundException('Destination account not found');

    const balanceAfter = account.balance + dto.amount;

    const transaction = await this.transactionRepo.create({
      idTransaction: transactionId,
      sourceAccountId: null,
      destinationAccountId: account.idAccount,
      type: dto.type,
      amount: dto.amount,
      balanceBefore: account.balance,
      balanceAfter,
      operatorUserId: dto.operatorUserId ?? null,
      timestamp: new Date(),
      visibleToAccountId: account.idAccount,
    });

    await this.accountRepo.update(account.idAccount, { balance: balanceAfter });
    return transaction;
  }
}