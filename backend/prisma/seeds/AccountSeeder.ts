import { PrismaClient, Account } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

export class AccountSeeder implements ISeeder {
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
          accountTypeId: accountType.id,
          status: "ACTIVE", // <-- novo campo obrigatório
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