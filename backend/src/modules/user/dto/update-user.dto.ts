import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating a user. All fields are optional.
 */
export class UpdateUserDto {
  /**
   * Name of the user.
   */
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * User email.
   */
  @ApiPropertyOptional({ example: 'john.doe@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  /**
   * User password (minimum 6 characters).
   */
  @ApiPropertyOptional({ example: 'newSecurePass123' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  /**
   * Role ID for the user.
   */
  @ApiPropertyOptional({ example: 'admin-role-id' })
  @IsString()
  @IsOptional()
  roleId?: string;
}