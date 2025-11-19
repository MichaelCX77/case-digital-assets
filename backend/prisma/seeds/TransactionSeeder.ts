import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';
import { randomUUID } from 'crypto';

/**
 * Seeder: creates an initial DEPOSIT transaction for demo/testing.
 * The transaction will be created for the first account and user found in the context.
 * Updated: Uses destinationAccountId and visibleToAccountId as per latest schema and business rule.
 */
export class TransactionSeeder implements ISeeder {
  /**
   * Seeds the database with a deposit transaction for the first account and user in the context.
   * @param prisma PrismaClient instance.
   * @param context Contains seeded accounts and users.
   */
  async run(prisma: PrismaClient, context: any) {
    const account = context.accounts[0];
    const user = context.users[0];

    await prisma.transaction.create({
      data: {
        transactionId: randomUUID(),
        destinationAccountId: account.idAccount,
        type: 'DEPOSIT',
        amount: 500,
        balanceBefore: account.balance,
        balanceAfter: account.balance + 500,
        operatorUserId: user.id,
        timestamp: new Date(),
        visibleToAccountId: account.idAccount, // Required backend-only field
      },
    });
  }
}