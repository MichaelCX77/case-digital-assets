import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * UpdateRoleDto
 *
 * DTO used to update an existing role.
 * All fields are optional; you can provide only the properties you wish to update.
 */
export class UpdateRoleDto {
  /**
   * The new name for the role (optional).
   */
  @ApiPropertyOptional({ example: 'admin', description: 'The new name for the role.' })
  name?: string;

  /**
   * The new description for the role (optional).
   */
  @ApiPropertyOptional({ example: 'Role with all access rights', description: 'The new description for the role.' })
  description?: string;
}