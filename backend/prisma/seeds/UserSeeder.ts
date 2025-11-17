// prisma/seeds/seed.users.ts
import { PrismaClient, User } from '@prisma/client';
import { ISeeder } from './core/ISeeder';
import * as bcrypt from 'bcrypt';

export class UserSeeder implements ISeeder {
  async run(prisma: PrismaClient, context: any) {
    const roles = context.roles;

    const usersData = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
        accessLevel: 'BASIC',
        roleName: 'PRIMARY',
      },
      {
        name: 'Mary Smith',
        email: 'mary@example.com',
        password: '123456',
        accessLevel: 'ADVANCED',
        roleName: 'OPERATOR',
      },
      {
        name: 'Administrator',
        email: 'admin@example.com',
        password: 'admin123',
        accessLevel: 'TOTAL',
        roleName: 'ADMIN',
      },
    ];

    const createdUsers: User[] = [];

    for (const u of usersData) {
      const hash = await bcrypt.hash(u.password, 10);

      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          password: hash,
          accessLevel: u.accessLevel,
          roleId: roles.get(u.roleName)!,
        },
        create: {
          name: u.name,
          email: u.email,
          password: hash,
          accessLevel: u.accessLevel,
          roleId: roles.get(u.roleName)!,
        },
      });

      createdUsers.push(user);
    }

    context.users = createdUsers;
  }
}
