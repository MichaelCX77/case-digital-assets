import { ApiProperty } from '@nestjs/swagger';
import { TransactionTypeEffective } from '../enums/transaction-type.enum';

/**
 * TransactionResponseDto
 *
 * DTO for returning transaction details in API responses.
 * Updated: Account identifiers now use sourceAccountId and destinationAccountId,
 * matching latest schema and business rules.
 *
 * - DEPOSIT: only destinationAccountId is set.
 * - WITHDRAW: only sourceAccountId is set.
 * - TRANSFER: both sourceAccountId and destinationAccountId are set.
 */
export class TransactionResponseDto {
  @ApiProperty({ example: 'tx-id-uuid' })
  idTransaction: string;

  @ApiProperty({ example: 'DEPOSIT' })
  type: TransactionTypeEffective;

  @ApiProperty({ example: 123 })
  amount: number;

  /** Source account for the transaction (nullable for deposit). */
  @ApiProperty({ example: 'source-account-id-uuid', description: 'Source account ID for this transaction.', nullable: true })
  sourceAccountId?: string | null;

  /** Destination account for the transaction (nullable for withdrawal). */
  @ApiProperty({ example: 'destination-account-id-uuid', description: 'Destination account ID for this transaction.', nullable: true })
  destinationAccountId?: string | null;

  @ApiProperty({ example: 1000, description: 'Balance before transaction.' })
  balanceBefore: number;

  @ApiProperty({ example: 1100, description: 'Balance after transaction.' })
  balanceAfter: number;

  @ApiProperty({ example: 'operator-user-id', nullable: true })
  operatorUserId: string | null;

  @ApiProperty({ example: '2025-11-19T13:23:00Z' })
  timestamp: Date;

  constructor(tx: any) {
    this.idTransaction = tx.idTransaction;
    this.type = tx.type;
    this.amount = tx.amount;
    this.sourceAccountId = tx.sourceAccountId ?? null;
    this.destinationAccountId = tx.destinationAccountId ?? null;
    this.balanceBefore = tx.balanceBefore;
    this.balanceAfter = tx.balanceAfter;
    this.operatorUserId = tx.operatorUserId ?? null;
    this.timestamp = tx.timestamp;
  }
}