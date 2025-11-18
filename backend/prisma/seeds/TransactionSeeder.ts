import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

/**
 * Seeder for creating an initial transaction record for testing/demo purposes.
 */
export class TransactionSeeder implements ISeeder {
  /**
   * Seeds the database with a single deposit transaction
   * for the first account and user found in the context.
   * @param prisma PrismaClient instance for database operations.
   * @param context Object containing seeded accounts and users.
   */
  async run(prisma: PrismaClient, context: any) {
    const account = context.accounts[0];
    const user = context.users[0];

    await prisma.transaction.create({
      data: {
        accountId: account.idAccount,
        type: 'DEPOSIT',
        amount: 500,
        balanceBefore: account.balance,
        balanceAfter: account.balance + 500,
        operatorUserId: user.id,
      },
    });
  }
}