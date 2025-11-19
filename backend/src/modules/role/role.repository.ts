import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Repository for handling role data operations.
 */
@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all roles.
   */
  async findAll() {
    return this.prisma.role.findMany();
  }

  /**
   * Create a new role.
   * @param data - Object with name and description.
   */
  async create(data: { name: string; description: string }) {
    return this.prisma.role.create({ data });
  }
  
  /**
   * Checks whether a role exists by its ID.
   * @param roleId - Role identifier.
   * @returns True if the role exists, false otherwise.
   */
  async roleExists(roleId: string): Promise<boolean> {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    return !!role;
  }

  /**
   * Find a role by its ID.
   * @param id - Role identifier.
   */
  async findById(id: string) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  /**
   * Update a role by its ID.
   * @param id - Role identifier.
   * @param data - Object with optional name and description.
   */
  async update(id: string, data: { name?: string; description?: string }) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a role by its ID.
   * @param id - Role identifier.
   */
  async delete(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}