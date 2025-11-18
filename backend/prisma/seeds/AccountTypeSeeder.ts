import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

export class AccountTypeSeeder implements ISeeder {
  async run(prisma: PrismaClient, context: any) {
    const accountTypesData = [
      {
        name: 'CHECKING',
        description: 'Standard checking account with unlimited transactions.',
      },
      {
        name: 'SAVINGS',
        description: 'Account with interest earnings and withdrawal limitations.',
      },
      {
        name: 'BUSINESS',
        description: 'Account for businesses with higher transaction limits.',
      },
      {
        name: 'STUDENT',
        description: 'Special account for students with lower fees.',
      },
    ];

    const accountTypes: any[] = [];

    for (const { name, description } of accountTypesData) {
      const accountType = await prisma.accountType.upsert({
        where: { name },
        update: { description },
        create: { name, description },
      });
      accountTypes.push(accountType);
    }

    context.accountTypes = accountTypes;
  }
}