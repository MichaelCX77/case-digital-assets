import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

export class RoleSeeder implements ISeeder {
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