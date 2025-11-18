import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAccount(accountId: string) {
    return this.prisma.transaction.findMany({
      where: { accountId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.transaction.create({
      data,
    });
  }
}