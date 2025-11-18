import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating a role.
 * All fields are optional.
 */
export class UpdateRoleDto {
  /**
   * Name of the role.
   */
  @ApiPropertyOptional({ example: 'admin' })
  name?: string;

  /**
   * Description of the role.
   */
  @ApiPropertyOptional({ example: 'Role with all access rights' })
  description?: string;
}