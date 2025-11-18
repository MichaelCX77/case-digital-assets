import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

/**
 * Seeder for populating the AccountType table with pre-configured types.
 * Adds types to context for use by other seeders.
 */
export class AccountTypeSeeder implements ISeeder {
  /**
   * Seeds the database with default account types using upsert.
   * Each account type is created if missing, or updated if already exists.
   * Adds the seeded types array to the context.
   * @param prisma PrismaClient instance for database operations.
   * @param context Object to save seeded AccountTypes for chaining.
   */
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