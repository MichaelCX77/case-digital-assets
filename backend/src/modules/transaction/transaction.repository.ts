import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds transactions that are visible to the given account ID.
   * @param accountId The account ID to filter by visibleToAccountId.
   * @returns Array of transactions ordered by timestamp descending.
   */
  async findByVisibleToAccountId(accountId: string) {
    return this.prisma.transaction.findMany({
      where: { visibleToAccountId: accountId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Lists all transactions.
   * @returns Array of all transactions ordered by timestamp descending.
   */
  async findAll() {
    return this.prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Finds a specific transaction by transactionId and type (composite key).
   * @param transactionId Transaction UUID.
   * @param type Transaction type (DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT).
   * @returns The transaction object or null.
   */
  async findByIdAndType(transactionId: string, type: string) {
    return this.prisma.transaction.findUnique({
      where: { transactionId_type: { transactionId, type } },
    });
  }

  /**
   * Creates a transaction record.
   * @param data Data for creation.
   * @returns The created transaction.
   */
  async create(data: any) {
    return this.prisma.transaction.create({ data });
  }
}