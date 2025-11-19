import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * DTO for creating a new role.
 */
export class CreateRoleDto {
  /**
   * Name of the role.
   */
  @ApiProperty({ example: 'admin' })
  @IsString()
  name: string;

  /**
   * Description of the role.
   */
  @ApiProperty({ example: 'Role with all access rights' })
  @IsString()
  description: string;
}