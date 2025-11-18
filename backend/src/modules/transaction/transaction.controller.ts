import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

/**
 * Controller for handling transaction-related endpoints.
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
    return this.service.getTransactions(accountId);
  }

  /**
   * Create a transfer transaction from a source account.
   * @param accountId - ID of the source account.
   * @param dto - Transfer transaction data.
   * @returns Created TransactionResponseDto.
   */
  @Post()
  @ApiOperation({ summary: 'Create a transfer from the source account to the destination account' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.service.createTransaction(accountId, dto);
  }
}