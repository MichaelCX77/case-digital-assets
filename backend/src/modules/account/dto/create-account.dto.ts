import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { AccountStatus } from '../enum/account-status.enum';

/**
 * DTO for creating a new account.
 */
export class CreateAccountDto {
  /**
   * Unique identifier of the user who owns the account.
   */
  @ApiProperty({ example: 'e6990ee3-ad45-42ce-b866-f61b26b5c168', format: 'uuid' })
  @IsUUID()
  userId: string;

  /**
   * Unique identifier of the account type.
   * Accepted values: CHECKING, SAVINGS, BUSINESS, STUDENT (use appropriate UUID).
   */
  @ApiProperty({ example: '30185be8-df34-4c06-a129-eaa5bace009c', format: 'uuid' })
  @IsUUID()
  accountTypeId: string;
}