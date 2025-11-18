import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Repository providing data access methods for Account domain.
 */
@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds and returns all accounts, including their account types.
   */
  async findAll() {
    return this.prisma.account.findMany({
      include: { accountType: true },
    });
  }

  /**
   * Creates a new account.
   * @param data Object containing account balance, accountTypeId and status.
   */
  async create(data: { balance: number; accountTypeId: string; status: string }) {
    return this.prisma.account.create({
      data: {
        balance: data.balance,
        accountTypeId: data.accountTypeId,
        status: data.status,
      },
      include: { accountType: true },
    });
  }

  /**
   * Finds a unique account by its ID, including account type.
   * @param id Unique identifier of the account.
   */
  async findById(id: string) {
    return this.prisma.account.findUnique({
      where: { idAccount: id },
      include: { accountType: true },
    });
  }

  /**
   * Deletes an account by its ID.
   * @param id Unique identifier of the account.
   */
  async delete(id: string) {
    return this.prisma.account.delete({
      where: { idAccount: id },
    });
  }

  /**
   * Lists all users linked to a given account, including their roles.
   * @param accountId Unique identifier of the account.
   */
  async listUsers(accountId: string) {
    return this.prisma.userAccount.findMany({
      where: { accountId },
      include: {
        user: { include: { role: true } },
      },
    });
  }

  /**
   * Adds a user to a given account.
   * @param accountId Unique identifier of the account.
   * @param userId Unique identifier of the user to add.
   * @returns The user-account link if it was created or already exists.
   */
  async addUser(accountId: string, userId: string) {
    const found = await this.prisma.userAccount.findUnique({
      where: { accountId_userId: { accountId, userId } },
    });
    if (found) return found;
    return this.prisma.userAccount.create({
      data: { accountId, userId },
    });
  }

  /**
   * Removes a user from an account.
   * @param accountId Unique identifier of the account.
   * @param userId Unique identifier of the user.
   */
  async removeUser(accountId: string, userId: string) {
    return this.prisma.userAccount.delete({
      where: { accountId_userId: { accountId, userId } },
    });
  }

  /**
   * Updates an account with new data.
   * @param id Unique identifier of the account.
   * @param data Prisma input for account update.
   */
  async update(id: string, data: Prisma.AccountUpdateInput) {
    return this.prisma.account.update({
      where: { idAccount: id },
      data,
      include: { accountType: true },
    });
  }
}