import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating an account type.
 * All fields are optional.
 */
export class UpdateAccountTypeDto {
  /**
   * Name of the account type (optional).
   */
  @ApiPropertyOptional({ example: 'SAVINGS' })
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * Description of the account type (optional).
   */
  @ApiPropertyOptional({ example: 'Account with interest earnings and withdrawal limitations.' })
  @IsOptional()
  @IsString()
  description?: string;
}