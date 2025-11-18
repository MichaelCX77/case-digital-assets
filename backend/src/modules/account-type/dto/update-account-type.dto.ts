import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an account type.
 * All fields are optional.
 */
export class UpdateAccountTypeDto {
  /**
   * Name of the account type (optional).
   */
  @ApiPropertyOptional({ example: 'SAVINGS' })
  name?: string;

  /**
   * Description of the account type (optional).
   */
  @ApiPropertyOptional({ example: 'Account with interest earnings and withdrawal limitations.' })
  description?: string;
}