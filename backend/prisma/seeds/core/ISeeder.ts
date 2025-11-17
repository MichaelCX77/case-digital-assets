import { PrismaClient } from '@prisma/client';

export interface ISeeder {
  run(prisma: PrismaClient, context: Record<string, any>): Promise<void>;
}
