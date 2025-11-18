import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Repository for handling transaction data operations.
 */
@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds all transactions for the given account, ordered by timestamp (descending).
   * @param accountId Account ID to search for transactions.
   */
  async findByAccount(accountId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Creates a transaction with the provided data.
   * @param data Transaction data (following Prisma schema).
   */
  async create(data: any) {
    return this.prisma.transaction.create({
      data,
    });
  }
}