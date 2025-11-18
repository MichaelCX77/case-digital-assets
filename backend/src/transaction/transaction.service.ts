import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from '../account/account.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionType } from './enums/transation-type.enum';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository
  ) {}

  async getTransactions(accountId: string): Promise<TransactionResponseDto[]> {
    const account = await this.accountRepo.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');
    const transactions = await this.transactionRepo.findByAccount(accountId);
    return transactions.map(tx => new TransactionResponseDto(tx));
  }

  async createTransaction(accountId: string, dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    // Só aceita TRANSFER no DTO!
    if (dto.type !== 'TRANSFER') {
      throw new BadRequestException('Only TRANSFER operations are permitted');
    }

    const account = await this.accountRepo.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');
    if (dto.amount <= 0) throw new BadRequestException('Amount must be positive');
    if (!dto.destinationAccountId) throw new BadRequestException({ message: 'Destination account ID required for transfer' });

    // Valida se o usuário operador é dono da conta origem
    const userAccounts = await this.accountRepo.listUsers(accountId);
    const isOwner = userAccounts.some(
      userAccount => userAccount.user?.id === dto.operatorUserId
    );
    if (!isOwner) {
      throw new ForbiddenException({ message: 'User is not owner of the source account' });
    }

    // Validação de saldo
    if (account.balance < dto.amount) {
      throw new BadRequestException({
        message: 'Insufficient funds',
        detail: { balance: account.balance }
      });
    }

    // Busca conta destino
    const destAccount = await this.accountRepo.findById(dto.destinationAccountId);
    if (!destAccount)
      throw new BadRequestException({ message: 'Destination account not found' });

    // Atualiza saldo origem
    const balanceAfterSource = account.balance - dto.amount;
    await this.accountRepo.update(accountId, { balance: balanceAfterSource });

    // Cria transação de saída (TRANSFER_OUT)
    const transactionOut = await this.transactionRepo.create({
      accountId,
      type: TransactionType.TRANSFER_OUT,
      amount: dto.amount,
      balanceBefore: account.balance,
      balanceAfter: balanceAfterSource,
      operatorUserId: dto.operatorUserId,
      timestamp: new Date(),
      destinationAccountId: dto.destinationAccountId,
    });

    // Atualiza saldo destino
    const balanceAfterDest = destAccount.balance + dto.amount;
    await this.accountRepo.update(dto.destinationAccountId, { balance: balanceAfterDest });

    // Cria transação de entrada (TRANSFER_IN)
    await this.transactionRepo.create({
      accountId: dto.destinationAccountId,
      type: TransactionType.TRANSFER_IN,
      amount: dto.amount,
      balanceBefore: destAccount.balance,
      balanceAfter: balanceAfterDest,
      operatorUserId: dto.operatorUserId,
      timestamp: new Date(),
      sourceAccountId: accountId,
    });

    return new TransactionResponseDto(transactionOut);
  }
}