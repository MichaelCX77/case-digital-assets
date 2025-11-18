import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing a user returned by the API.
 */
export class UserResponseDto {
  /**
   * Unique identifier for the user.
   */
  @ApiProperty({ example: 'd259eb2a-ef82-46f2-90de-226a3c6cf507' })
  id: string;

  /**
   * Name of the user.
   */
  @ApiProperty({ example: 'John Doe' })
  name: string;

  /**
   * Email of the user.
   */
  @ApiProperty({ example: 'john.doe@email.com' })
  email: string;

  /**
   * Role of the user, or null if none.
   */
  @ApiProperty({
    example: { id: 'admin-role-id', name: 'admin' },
    nullable: true,
  })
  role: { id: string; name: string } | null;

  /**
   * Timestamp of when the user was created.
   */
  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;

  /**
   * Timestamp of when the user was last updated.
   */
  @ApiProperty({ example: '2024-01-01T12:15:00.000Z' })
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role ? { id: user.role.id, name: user.role.name } : null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}