import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { TransactionTypeOptions } from '../enums/transaction-type.enum';

/**
 * CreateTransactionDto
 *
 * DTO for creating a transaction.
 * Allows DEPOSIT, WITHDRAW, TRANSFER (all fields are optional except type and amount).
 * Business validation must be enforced in the service layer:
 * - DEPOSIT: only destinationAccountId is set/required.
 * - WITHDRAW: only sourceAccountId and operatorUserId are set/required. Operator must be owner.
 * - TRANSFER: both sourceAccountId and destinationAccountId are required. Operator must be owner of source.
 */
export class CreateTransactionDto {
  /** The type of operation: "DEPOSIT", "WITHDRAW", or "TRANSFER". */
  @ApiProperty({ example: 'DEPOSIT', description: 'Operation type: DEPOSIT, WITHDRAW, TRANSFER.' })
  @IsString()
  type: TransactionTypeOptions;

  /** Amount for the transaction. */
  @ApiProperty({ example: 100, description: 'Amount for the transaction.' })
  @IsNumber()
  amount: number;

  /** Source account ID (required for WITHDRAW and TRANSFER, never for DEPOSIT). */
  @ApiProperty({
    example: 'source-account-id-uuid',
    description: 'Source account ID (required for WITHDRAW and TRANSFER).',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  sourceAccountId?: string;

  /** Destination account ID (required for DEPOSIT and TRANSFER, never for WITHDRAW). */
  @ApiProperty({
    example: 'destination-account-id-uuid',
    description: 'Destination account ID (required for DEPOSIT and TRANSFER).',
    required: false
  })
  @IsString()
  @IsOptional()
  @IsUUID()
  destinationAccountId?: string;

  /** User who initiates the transaction (required for transfer and withdrawal, optional for deposit). */
  @ApiProperty({ example: 'operator-user-id', description: 'Operator user ID (required for withdrawal/transfer, optional for deposit).', required: false })
  @IsString()
  @IsOptional()
  @IsUUID()
  operatorUserId?: string;
}