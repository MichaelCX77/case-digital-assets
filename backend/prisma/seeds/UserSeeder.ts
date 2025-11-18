import { PrismaClient, User } from '@prisma/client';
import { ISeeder } from './core/ISeeder';
import * as bcrypt from 'bcrypt';

/**
 * Seeder for populating the User table with initial users.
 * Uses roles from context and hashes passwords before creating users.
 */
export class UserSeeder implements ISeeder {
  /**
   * Seeds the database with default users using upsert.
   * Each user is created if missing, or updated if already exists.
   * Passwords are securely hashed using bcrypt.
   * Adds an array of created users to the context for use by other seeders.
   * @param prisma PrismaClient instance for database operations.
   * @param context Object containing roles and receives seeded users.
   */
  async run(prisma: PrismaClient, context: any) {
    const roles = context.roles;

    const usersData = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
        roleName: 'OWNER',
      },
      {
        name: 'Mary Smith',
        email: 'mary@example.com',
        password: '123456',
        roleName: 'OPERATOR',
      },
      {
        name: 'Administrator',
        email: 'admin@example.com',
        password: 'admin123',
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
          roleId: roles.get(u.roleName)!,
        },
        create: {
          name: u.name,
          email: u.email,
          password: hash,
          roleId: roles.get(u.roleName)!,
        },
      });

      createdUsers.push(user);
    }

    context.users = createdUsers;
  }
}