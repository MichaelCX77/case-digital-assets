// prisma/seeds/seed.roles.ts
import { PrismaClient } from '@prisma/client';
import { ISeeder } from './core/ISeeder';

export class RoleSeeder implements ISeeder {
  async run(prisma: PrismaClient, context: any) {
    const roleNames = ['OWNER', 'OPERATOR', 'ADMIN'];
    const rolesMap = new Map<string, string>(); // UUIDs são strings

    for (const name of roleNames) {
      const role = await prisma.role.upsert({
        where: { name },
        update: {}, // nada a atualizar
        create: { name },
      });

      rolesMap.set(name, role.id); // role.id agora é string (UUID)
    }

    context.roles = rolesMap;
  }
}
