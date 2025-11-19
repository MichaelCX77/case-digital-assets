import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * DTO for creating a new account type.
 */
export class CreateAccountTypeDto {
  /**
   * Name of the account type.
   */
  @ApiProperty({ example: 'SAVINGS' })
  @IsString()
  name: string;

  /**
   * Description of the account type.
   */
  @ApiProperty({ example: 'Account with interest earnings and withdrawal limitations.' })
  @IsString()
  description: string;
}