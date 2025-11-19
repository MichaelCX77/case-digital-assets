import { Controller, Get, Post, Param, Body, HttpCode, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

/**
 * Controller for transaction resource endpoints.
 * Handles output DTO assembly (TransactionResponseDto).
 */
@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly service: TransactionService
  ) {}

  /**
   * List all transactions, optionally filtered by accountId.
   * @param accountId - Optional: source account ID to filter by.
   * @returns Array of TransactionResponseDto.
   */
  @Get()
  @ApiOperation({ summary: 'List all transactions, optionally filtered by accountId' })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async list(@Query('accountId') accountId?: string) {
    const transactions = await this.service.getTransactions(accountId);
    return transactions.map(tx => new TransactionResponseDto(tx));
  }

  /**
   * Get a specific transaction by its transactionId and type.
   * @param transactionId - Transaction UUID.
   * @param type - Transaction type (DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT).
   * @returns TransactionResponseDto.
   */
  @Get(':transactionId/:type')
  @ApiOperation({ summary: 'Get a transaction by transactionId and type' })
  @ApiParam({ name: 'transactionId', type: String })
  @ApiParam({ name: 'type', type: String })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async getById(
    @Param('transactionId') transactionId: string,
    @Param('type') type: string,
  ) {
    const transaction = await this.service.getTransactionByIdAndType(transactionId, type);
    return new TransactionResponseDto(transaction);
  }

  /**
   * Create a transaction (DEPOSIT, WITHDRAW, TRANSFER).
   * For TRANSFER: "amount", "operatorUserId", and "destinationAccountId" are required.
   * For DEPOSIT/WITHDRAW: "accountId", "amount", and type required; operatorUserId is optional.
   * Output DTO is assembled in the controller.
   * @param dto - Transaction data.
   * @returns Created TransactionResponseDto.
   */
  @Post()
  @ApiOperation({ summary: 'Create a transaction (DEPOSIT, WITHDRAW, TRANSFER)' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, type: TransactionResponseDto })
  @HttpCode(201)
  async create(@Body() dto: CreateTransactionDto) {
    const transaction = await this.service.createTransaction(dto);
    return new TransactionResponseDto(transaction);
  }
}