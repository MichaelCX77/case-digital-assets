import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.accountType.findMany();
  }

  async create(data: { name: string; description: string }) {
    return this.prisma.accountType.create({ data });
  }

  async findById(id: string) {
    return this.prisma.accountType.findUnique({ where: { id } });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return this.prisma.accountType.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.accountType.delete({ where: { id } });
  }
}