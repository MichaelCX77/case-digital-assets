import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('accounts/:accountId/transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Get()
  async list(@Param('accountId') accountId: string) {
    return this.service.getTransactions(accountId);
  }

  @Post()
  @HttpCode(201)
  async create(@Param('accountId') accountId: string, @Body() dto: CreateTransactionDto) {
    return this.service.createTransaction(accountId, dto);
  }
}