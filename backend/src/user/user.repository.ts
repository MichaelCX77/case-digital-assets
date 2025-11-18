import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findRoleNameByEmail(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    return user && user.role ? user.role.name : null;
  }

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

  async delete(id: string) {
    await this.prisma.userAccount.deleteMany({ where: { userId: id } });
    await this.prisma.transaction.deleteMany({ where: { operatorUserId: id } });
    return this.prisma.user.delete({ where: { id } });
  }

  async listAccounts(userId: string) {
    return this.prisma.userAccount.findMany({
      where: { userId },
      include: { account: true },
    });
  }

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