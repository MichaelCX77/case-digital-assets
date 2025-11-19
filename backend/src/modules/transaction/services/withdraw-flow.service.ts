import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../transaction.repository';
import { AccountRepository } from '../../account/account.repository';
import { WithdrawFlow } from '../interfaces/transaction-flow.interface';

@Injectable()
export class WithdrawFlowService implements WithdrawFlow {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository
  ) {}

  async execute(dto: any, transactionId: string) {
    if (!dto.sourceAccountId)
      throw new BadRequestException('sourceAccountId is required for withdrawal');
    if (!dto.operatorUserId)
      throw new BadRequestException('operatorUserId is required for withdrawal');

    const account = await this.accountRepo.findById(dto.sourceAccountId);
    if (!account) throw new NotFoundException('Account not found');

    const userAccounts = await this.accountRepo.listUsers(dto.sourceAccountId);
    const isOwner = userAccounts.some(ua => ua.user?.id === dto.operatorUserId);
    if (!isOwner) {
      throw new ForbiddenException('User is not owner of the account');
    }

    if (account.balance < dto.amount)
      throw new BadRequestException({
        message: 'Insufficient funds',
        detail: { balance: account.balance }
      });

    const balanceAfter = account.balance - dto.amount;
    await this.accountRepo.update(dto.sourceAccountId, { balance: balanceAfter });

    const transaction = await this.transactionRepo.create({
      idTransaction: transactionId,
      sourceAccountId: dto.sourceAccountId,
      destinationAccountId: null,
      type: dto.type,
      amount: dto.amount,
      balanceBefore: account.balance,
      balanceAfter,
      operatorUserId: dto.operatorUserId,
      timestamp: new Date(),
      visibleToAccountId: dto.sourceAccountId,
    });
    return transaction;
  }
}