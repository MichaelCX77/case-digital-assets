import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

/**
 * Controller for handling transaction-related endpoints.
 * É responsável por montar os DTOs de saída (TransactionResponseDto).
 */
@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('accounts/:accountId/transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  /**
   * List all transactions for a given account.
   * @param accountId - ID of the source account.
   * @returns Array of TransactionResponseDto.
   */
  @Get()
  @ApiOperation({ summary: 'List all transactions for an account' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async list(@Param('accountId') accountId: string) {
    const transactions = await this.service.getTransactions(accountId);
    return transactions.map(tx => new TransactionResponseDto(tx));
  }

  /**
   * Create a transaction for the given account.
   * Para transferências, os campos "amount", "operatorUserId" e "destinationAccountId" são obrigatórios.
   * O DTO de saída é montado na controller.
   * @param accountId - ID of the source account.
   * @param dto - Transaction data.
   * @returns Created TransactionResponseDto.
   */
  @Post()
  @ApiOperation({ summary: 'Create a transfer transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  @HttpCode(201)
  async create(
    @Param('accountId') accountId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    const transaction = await this.service.createTransaction(accountId, dto);
    return new TransactionResponseDto(transaction);
  }
}