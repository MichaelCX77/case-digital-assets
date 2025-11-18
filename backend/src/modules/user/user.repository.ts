import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Repository for handling user data operations.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users with their respective roles.
   */
  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
    });
  }

  /**
   * Find a user by their ID, including role.
   * @param id - User identifier.
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  /**
   * Find a user by their email, including role.
   * @param email - User email.
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  /**
   * Find role name by user email.
   * @param email - User email.
   * @returns Role name or null.
   */
  async findRoleNameByEmail(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    return user && user.role ? user.role.name : null;
  }

  /**
   * Create a new user with hashed password.
   * @param data - User creation data.
   * @returns Created user including role.
   */
  async create(data: { name: string; email: string; password: string; roleId: string }) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hash,
      },
      include: { role: true },
    });
  }

  /**
   * Update a user by ID, hash password if present.
   * @param id - User identifier.
   * @param data - Partial update data.
   * @returns Updated user including role.
   */
  async update(id: string, data: Partial<{ name: string; email: string; password: string; roleId: string }>) {
    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });
  }

  /**
   * Delete a user by ID and related records.
   * @param id - User identifier.
   * @returns Deleted user.
   */
  async delete(id: string) {
    await this.prisma.userAccount.deleteMany({ where: { userId: id } });
    await this.prisma.transaction.deleteMany({ where: { operatorUserId: id } });
    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * List all accounts linked to a user.
   * @param userId - User identifier.
   * @returns Array of user accounts (with account info).
   */
  async listAccounts(userId: string) {
    return this.prisma.userAccount.findMany({
      where: { userId },
      include: { account: true },
    });
  }

  /**
   * Link an account to a user. Returns existing link if present.
   * @param userId - User identifier.
   * @param accountId - Account identifier.
   * @returns User-account link.
   */
  async linkAccount(userId: string, accountId: string) {
    const found = await this.prisma.userAccount.findUnique({
      where: { accountId_userId: { accountId, userId } }
    });
    if (found) return found;
    return this.prisma.userAccount.create({
      data: { userId, accountId }
    });
  }
}