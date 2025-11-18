import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

/**
 * Seeder for populating the Role table with default roles.
 * Adds roles to context as a map of name to role ID.
 */
export class RoleSeeder implements ISeeder {
  /**
   * Seeds the database with default roles using upsert.
   * Each role is created if missing, or updated if already exists.
   * Adds a map of role names to their UUIDs to the context for later use.
   * @param prisma PrismaClient instance for database operations.
   * @param context Object to receive the seeded roles map for chaining.
   */
  async run(prisma: PrismaClient, context: any) {
    const rolesData = [
      { name: 'OWNER', description: 'Owner has full access and controls all resources.' },
      { name: 'OPERATOR', description: 'Operator can manage operations but has limited administrative privileges.' },
      { name: 'ADMIN', description: 'Admin can manage and configure users, accounts and settings.' },
    ];
    const rolesMap = new Map<string, string>(); // UUIDs are strings

    for (const { name, description } of rolesData) {
      const role = await prisma.role.upsert({
        where: { name },
        update: { description },
        create: { name, description },
      });

      rolesMap.set(name, role.id); // role.id is string (UUID)
    }

    context.roles = rolesMap;
  }
}