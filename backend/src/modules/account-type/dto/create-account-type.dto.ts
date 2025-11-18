import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new account type.
 */
export class CreateAccountTypeDto {
  /**
   * Name of the account type.
   */
  @ApiProperty({ example: 'SAVINGS' })
  name: string;

  /**
   * Description of the account type.
   */
  @ApiProperty({ example: 'Account with interest earnings and withdrawal limitations.' })
  description: string;
}