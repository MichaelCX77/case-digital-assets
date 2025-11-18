import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new role.
 */
export class CreateRoleDto {
  /**
   * Name of the role.
   */
  @ApiProperty({ example: 'admin' })
  name: string;

  /**
   * Description of the role.
   */
  @ApiProperty({ example: 'Role with all access rights' })
  description: string;
}