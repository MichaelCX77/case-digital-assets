import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an account. All fields are optional.
 */
export class UpdateAccountDto {
  /**
   * Unique identifier of the account type (optional).
   */
  @ApiPropertyOptional({ example: '30185be8-df34-4c06-a129-eaa5bace009c' })
  accountTypeId?: string;

  /**
   * Status of the account (optional).
   */
  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;
}