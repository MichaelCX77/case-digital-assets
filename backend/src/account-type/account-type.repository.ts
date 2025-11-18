import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';

@Injectable()
export class AccountTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.accountType.findMany();
  }

  async create(data: CreateAccountTypeDto) {
    return this.prisma.accountType.create({ data });
  }

  async findById(id: string) {
    return this.prisma.accountType.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return this.prisma.accountType.delete({ where: { id } });
  }
}