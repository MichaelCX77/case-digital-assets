import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany();
  }

  async create(data: { name: string; description: string }) {
    return this.prisma.role.create({ data });
  }

  async findById(id: string) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}