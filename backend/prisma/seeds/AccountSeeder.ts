import { PrismaClient, Account } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

/**
 * Seeder for populating the Account table.
 * Requires AccountTypes and Users in the context for correct seeding.
 */
export class AccountSeeder implements ISeeder {
  /**
   * Seeds accounts for each user using available account types.
   * Each user is assigned an account with a default balance and ACTIVE status.
   * Also creates userAccount link for each association.
   * Adds the created accounts array to the context.
   * @param prisma PrismaClient instance for database operations.
   * @param context Object containing seeded AccountTypes and Users, will receive seeded Accounts.
   * @throws Error if account types are missing in context.
   */
  async run(prisma: PrismaClient, context: any) {
    const accounts: Account[] = [];
    const accountTypes = context.accountTypes;
    if (!accountTypes || accountTypes.length === 0) {
      throw new Error("No AccountTypes found in context for seeding Accounts!");
    }

    for (const [i, user] of context.users.entries()) {
      const accountType = accountTypes[i % accountTypes.length];
      const account = await prisma.account.create({
        data: {
          balance: 10,
          accountTypeId: accountType.id
        },
      });

      await prisma.userAccount.create({
        data: {
          accountId: account.idAccount,
          userId: user.id,
        },
      });

      accounts.push(account);
    }

    context.accounts = accounts;
  }
}