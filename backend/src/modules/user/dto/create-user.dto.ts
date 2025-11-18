import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new user.
 */
export class CreateUserDto {
  /**
   * Name of the user.
   */
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * User email.
   */
  @ApiProperty({ example: 'john.doe@email.com' })
  @IsEmail()
  email: string;

  /**
   * User password (minimum 6 characters).
   */
  @ApiProperty({ example: 'securePass123' })
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * Role ID for the user.
   */
  @ApiProperty({ example: 'admin-role-id' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}