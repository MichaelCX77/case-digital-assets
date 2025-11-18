import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for relating a user to an account.
 */
export class AccountUserDto {
  /**
   * Unique identifier of the user.
   */
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'e6990ee3-ad45-42ce-b866-f61b26b5c168',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;
}