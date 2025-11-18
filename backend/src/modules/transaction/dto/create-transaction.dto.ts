import { ApiProperty } from '@nestjs/swagger';

/**
 * CreateTransactionDto
 *
 * DTO representing data required to create a transfer transaction.
 *
 * All fields are required and must be provided when requesting a new transfer.
 * The only accepted value for `type` is "TRANSFER" (handled/validated by service).
 */
export class CreateTransactionDto {
  /**
   * The type of transaction. Only "TRANSFER" is accepted.
   */
  @ApiProperty({ example: 'TRANSFER', description: 'The operation type. Only TRANSFER is allowed.' })
  type: string;

  /**
   * Amount to transfer between accounts.
   */
  @ApiProperty({ example: 100, description: 'Amount to transfer.' })
  amount: number;

  /**
   * ID of the destination account that will receive the transfer.
   */
  @ApiProperty({ example: 'destination-account-id', description: 'ID of destination account.' })
  destinationAccountId: string;

  /**
   * ID of the operator user who must be the owner of the source account (accountId in route parameter).
   */
  @ApiProperty({ example: 'operator-user-id', description: 'ID of the operator user who owns the source account.' })
  operatorUserId: string;
}