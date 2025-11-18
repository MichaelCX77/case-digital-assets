import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Repository providing data access methods for account types.
 */
@Injectable()
export class AccountTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds and returns all account types.
   */
  async findAll() {
    return this.prisma.accountType.findMany();
  }

  /**
   * Creates a new account type.
   * @param data Object containing name and description.
   */
  async create(data: { name: string; description: string }) {
    return this.prisma.accountType.create({ data });
  }

  /**
   * Finds a unique account type by its ID.
   * @param id Unique identifier of the account type.
   */
  async findById(id: string) {
    return this.prisma.accountType.findUnique({ where: { id } });
  }

  /**
   * Updates an account type.
   * @param id Unique identifier of the account type.
   * @param data Object containing fields to update.
   */
  async update(id: string, data: { name?: string; description?: string }) {
    return this.prisma.accountType.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes an account type by ID.
   * @param id Unique identifier of the account type.
   */
  async delete(id: string) {
    return this.prisma.accountType.delete({ where: { id } });
  }
}