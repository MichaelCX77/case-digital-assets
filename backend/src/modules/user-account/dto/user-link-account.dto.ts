import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for linking an account.
 */
export class UserLinkAccountDto {
  /**
   * ID of the account to be linked.
   */
  @ApiProperty({ example: 'account-id-123' })
  @IsString()
  accountId: string;
}