import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from '../account/account.repository';
import { UserRepository } from '../user/user.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionTypeEffective, TransactionTypeOptions } from './enums/transaction-type.enum';
import { randomUUID } from 'crypto';

/**
 * Central utility for generating transaction IDs.
 * Always use this for every transaction to ensure ID consistency, even when batching.
 */
function generateTransactionId(): string {
  return randomUUID();
}

/**
 * Service responsible for transaction business logic.
 * Validates user and account existence before any transaction.
 * Supports deposit, withdrawal, and transfer operations.
 */
@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository,
    private readonly userRepo: UserRepository
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
      // Filtra exclusivamente pelo campo de visibilidade
      return this.transactionRepo.findByVisibleToAccountId(accountId);
    }
    return this.transactionRepo.findAll();
  }

  /**
   * Get a specific transaction by idTransaction and type.
   * @param idTransaction - Transaction UUID.
   * @param type - Transaction type (DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT).
   * @returns The transaction, or throws NotFoundException.
   */
  async getTransactionByIdAndType(idTransaction: string, type: string) {
    const transaction = await this.transactionRepo.findByIdAndType(idTransaction, type);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  /**
   * Create a new transaction (deposit, withdrawal, or transfer).
   * Backend sets visibleToAccountId for each.
   * Para TRANSFER, retorna apenas o registro TRANSFER_OUT criado (mais relevante para resposta POST).
   * @param dto Transaction details.
   * @param idTransaction Optional UUID for this transaction. If not provided, generated automatically. For TRANSFER, use the same for both sub-operations.
   * @returns The created transaction, or for TRANSFER, only the TRANSFER_OUT record.
   */
  async createTransaction(dto: CreateTransactionDto, idTransaction?: string) {
    const transactionId = idTransaction ?? generateTransactionId();

    if (!dto.type || !dto.amount)
      throw new BadRequestException('Type and amount are required');
    if (dto.amount <= 0)
      throw new BadRequestException('Amount must be positive');

    // Validate operator user if provided
    if (dto.operatorUserId) {
      const user = await this.userRepo.findById(dto.operatorUserId);
      if (!user) throw new NotFoundException('Operator user not found');
    }

    // TRANSFER operation
    if (dto.type === TransactionTypeOptions.TRANSFER) {
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

      // Agora retorna **apenas** o TRANSFER_OUT (mais útil para response do POST)
      return transactionOut;
    }

    // WITHDRAW operation
    if (dto.type === TransactionTypeOptions.WITHDRAW) {
      if (!dto.sourceAccountId)
        throw new BadRequestException('sourceAccountId is required for withdrawal');
      if (!dto.operatorUserId)
        throw new BadRequestException('operatorUserId is required for withdrawal');

      const account = await this.accountRepo.findById(dto.sourceAccountId);
      if (!account) throw new NotFoundException('Account not found');

      // WITHDRAW: Operator must be owner
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

    // DEPOSIT operation
    if (dto.type === TransactionTypeOptions.DEPOSIT) {
      if (!dto.destinationAccountId)
        throw new BadRequestException('destinationAccountId is required for deposit');
      const account = await this.accountRepo.findById(dto.destinationAccountId);
      if (!account) throw new NotFoundException('Destination account not found');

      if (dto.operatorUserId) {
        const user = await this.userRepo.findById(dto.operatorUserId);
        if (!user) throw new NotFoundException('Operator user not found');
      }

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

    throw new BadRequestException('Unsupported transaction type');
  }
}