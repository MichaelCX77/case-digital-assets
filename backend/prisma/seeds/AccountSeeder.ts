import { PrismaClient, Account } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

export class AccountSeeder implements ISeeder {
  async run(prisma: PrismaClient, context: any) {
    const accounts: Account[] = [];

    for (const user of context.users) {
      const account = await prisma.account.create({
        data: { balance: 1000 },
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
