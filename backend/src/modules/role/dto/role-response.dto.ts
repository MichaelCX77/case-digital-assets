import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing a role returned by the API.
 */
export class RoleResponseDto {
  /**
   * Unique identifier for the role.
   */
  @ApiProperty({ example: 'c5e1f140-3f22-41b7-b59d-1f81158d9b51' })
  id: string;

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

  /**
   * Timestamp of when the role was created.
   */
  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;

  /**
   * Timestamp of when the role was last updated.
   */
  @ApiProperty({ example: '2024-01-01T12:15:00.000Z' })
  updatedAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}