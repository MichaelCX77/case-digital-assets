import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

export class TransactionSeeder implements ISeeder {
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
