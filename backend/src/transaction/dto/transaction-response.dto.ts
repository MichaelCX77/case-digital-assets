import { ApiProperty } from '@nestjs/swagger';

/**
 * TransactionResponseDto
 * 
 * DTO representing transaction responses from the API.
 * 
 * Includes transaction identifiers, account information, type,
 * amounts, timestamps, balance change tracking, and transfer metadata.
 */
export class TransactionResponseDto {
  /** Unique transaction identifier */
  @ApiProperty()
  idTransaction: string;

  /** Account performing or receiving the transaction */
  @ApiProperty()
  accountId: string;

  /** Transaction type: TRANSFER_OUT, TRANSFER_IN, DEPOSIT or WITHDRAW */
  @ApiProperty({ example: 'TRANSFER_OUT or TRANSFER_IN' })
  type: string;

  /** Transaction amount/value */
  @ApiProperty()
  amount: number;

  /** Transaction event datetime */
  @ApiProperty()
  timestamp: Date;

  /** Balance before transaction execution */
  @ApiProperty()
  balanceBefore: number;

  /** Balance after transaction execution */
  @ApiProperty()
  balanceAfter: number;

  /** User/operator who performed the transaction (optional) */
  @ApiProperty({ required: false })
  operatorUserId?: string;

  /** Transaction creation datetime */
  @ApiProperty()
  createdAt: Date;

  /** Transaction last update datetime */
  @ApiProperty()
  updatedAt: Date;

  /** Destination account (for transfer operations, optional) */
  @ApiProperty({ required: false })
  destinationAccountId?: string; 

  /** Source account (for transfer operations, optional) */
  @ApiProperty({ required: false })
  sourceAccountId?: string;

  /**
   * Instantiate TransactionResponseDto from a data object
   * @param data All properties for TransactionResponseDto
   */
  constructor(data: any) {
    this.idTransaction = data.idTransaction;
    this.accountId = data.accountId;
    this.type = data.type;
    this.amount = data.amount;
    this.timestamp = data.timestamp;
    this.balanceBefore = data.balanceBefore;
    this.balanceAfter = data.balanceAfter;
    this.operatorUserId = data.operatorUserId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.destinationAccountId = data.destinationAccountId;
    this.sourceAccountId = data.sourceAccountId;
  }
}