import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.account.findMany({
      include: { accountType: true },
    });
  }

  // Atualizado para aceitar balance, accountTypeId e status como parâmetros obrigatórios
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

  async findById(id: string) {
    return this.prisma.account.findUnique({
      where: { idAccount: id },
      include: { accountType: true },
    });
  }

  async delete(id: string) {
    return this.prisma.account.delete({
      where: { idAccount: id },
    });
  }

  async listUsers(accountId: string) {
    return this.prisma.userAccount.findMany({
      where: { accountId },
      include: {
        user: { include: { role: true } },
      },
    });
  }

  async addUser(accountId: string, userId: string) {
    const found = await this.prisma.userAccount.findUnique({
      where: { accountId_userId: { accountId, userId } },
    });
    if (found) return found;
    return this.prisma.userAccount.create({
      data: { accountId, userId },
    });
  }

  // Opcional: método para remoção de usuário vinculado
  async removeUser(accountId: string, userId: string) {
    return this.prisma.userAccount.delete({
      where: { accountId_userId: { accountId, userId } },
    });
  }

  async update(id: string, data: Prisma.AccountUpdateInput) {
    return this.prisma.account.update({
      where: { idAccount: id },
      data,
      include: { accountType: true },
    });
  }
}