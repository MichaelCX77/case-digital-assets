import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for returning account type information.
 */
export class AccountTypeResponseDto {
  /**
   * Unique identifier of the account type.
   */
  @ApiProperty({ example: '30185be8-df34-4c06-a129-eaa5bace009c' })
  id: string;

  /**
   * Name of the account type.
   */
  @ApiProperty({ example: 'CHECKING' })
  name: string;

  /**
   * Description of the account type features.
   */
  @ApiProperty({ example: 'Standard checking account with unlimited transactions.' })
  description: string;

  /**
   * Date when account type was created.
   */
  @ApiProperty({ example: '2025-11-17T23:51:44.570Z', type: String, format: 'date-time' })
  createdAt: Date;

  /**
   * Date when account type was last updated.
   */
  @ApiProperty({ example: '2025-11-17T23:51:44.570Z', type: String, format: 'date-time' })
  updatedAt: Date;

  constructor(model: any) {
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }
}