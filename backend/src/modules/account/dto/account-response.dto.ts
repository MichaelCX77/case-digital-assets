import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../enum/account-status.enum';

/**
 * DTO for returning account information.
 */
export class AccountResponseDto {
  /**
   * Account unique identifier.
   */
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  /**
   * Account balance.
   */
  @ApiProperty({ example: 1000.50 })
  balance: number;

  /**
   * Account type ID.
   */
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  accountTypeId: string;

  /**
   * Name of the account type.
   */
  @ApiProperty({ example: 'Savings', required: false })
  accountTypeName?: string;

  /**
   * Current account status.
   */
  @ApiProperty({ example: AccountStatus.ACTIVE })
  status: AccountStatus;

  /**
   * Date when account was created.
   */
  @ApiProperty({ example: '2023-05-18T12:34:56.789Z', type: String, format: 'date-time' })
  createdAt: Date;

  /**
   * Date when account was last updated.
   */
  @ApiProperty({ example: '2023-06-18T12:34:56.789Z', type: String, format: 'date-time' })
  updatedAt: Date;

  constructor(account: any) {
    this.id = account.idAccount;
    this.balance = account.balance;
    this.accountTypeId = account.accountTypeId;
    this.accountTypeName = account.accountType?.name;
    this.status = account.status;
    this.createdAt = account.createdAt;
    this.updatedAt = account.updatedAt;
  }
}