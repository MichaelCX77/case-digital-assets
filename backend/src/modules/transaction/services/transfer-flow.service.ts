import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../transaction.repository';
import { AccountRepository } from '../../account/account.repository';
import { TransferFlow } from '../interfaces/transaction-flow.interface';
import { TransactionTypeEffective } from '../enums/transaction-type.enum';

@Injectable()
export class TransferFlowService implements TransferFlow {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository
  ) {}

  async execute(dto: any, transactionId: string) {
    if (!dto.sourceAccountId)
      throw new BadRequestException('sourceAccountId is required for transfer');
    if (!dto.destinationAccountId)
      throw new BadRequestException('destinationAccountId is required for transfer');
    if (!dto.operatorUserId)
      throw new BadRequestException('operatorUserId is required for transfer');

    const sourceAccount = await this.accountRepo.findById(dto.sourceAccountId);
    if (!sourceAccount) throw new NotFoundException('Source account not found');
    const userAccounts = await this.accountRepo.listUsers(dto.sourceAccountId);
    const isOwner = userAccounts.some(ua => ua.user?.id === dto.operatorUserId);
    if (!isOwner) {
      throw new ForbiddenException('User is not owner of the source account');
    }
    if (sourceAccount.balance < dto.amount) {
      throw new BadRequestException({
        message: 'Insufficient funds',
        detail: { balance: sourceAccount.balance }
      });
    }
    const destAccount = await this.accountRepo.findById(dto.destinationAccountId);
    if (!destAccount)
      throw new NotFoundException('Destination account not found');

    // TRANSFER_OUT: visible only to source account
    const balanceAfterSource = sourceAccount.balance - dto.amount;
    await this.accountRepo.update(dto.sourceAccountId, { balance: balanceAfterSource });
    const transactionOut = await this.transactionRepo.create({
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

    // TRANSFER_IN: visible only to destination account
    const balanceAfterDest = destAccount.balance + dto.amount;
    await this.accountRepo.update(dto.destinationAccountId, { balance: balanceAfterDest });
    await this.transactionRepo.create({
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

    // Retorna apenas TRANSFER_OUT (para o POST)
    return transactionOut;
  }
}