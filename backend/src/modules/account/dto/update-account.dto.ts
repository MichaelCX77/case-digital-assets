import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { AccountStatus } from '../enum/account-status.enum';

/**
 * DTO for updating an account. All fields are optional.
 */
export class UpdateAccountDto {
  /**
   * Unique identifier of the account type (optional).
   */
  @ApiPropertyOptional({ example: '30185be8-df34-4c06-a129-eaa5bace009c' })
  @IsOptional()
  @IsUUID()
  accountTypeId?: string;

  /**
   * Status of the account (optional).
   */
  @ApiPropertyOptional({ example: AccountStatus.ACTIVE })
  @IsOptional()
  @IsEnum(AccountStatus, { message: `Status must be one of: ${Object.values(AccountStatus).join(', ')}` })
  status?: AccountStatus;
}