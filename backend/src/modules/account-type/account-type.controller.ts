import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { AccountTypeService } from './account-type.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { AccountTypeResponseDto } from './dto/account-type-response.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { accountTypeListResponseExample, accountTypeByIdResponseExample } from './swagger/account-type.swagger-example';

/**
 * Controller handling account type-related operations.
 * Responsible for assembling output DTOs for API responses.
 */
@ApiTags('Account Types')
@Controller('account-types')
export class AccountTypeController {
  constructor(private readonly service: AccountTypeService) {}

  /**
   * Returns a list of all account types.
   * @returns Array of AccountTypeResponseDto.
   */
  @Get()
  @ApiOperation({ summary: 'List all account types' })
  @ApiResponse({
    status: 200,
    type: [AccountTypeResponseDto],
    description: 'Array of account types',
    examples: {
      example: {
        summary: 'Example response',
        value: accountTypeListResponseExample,
      }
    }
  })
  async list() {
    const types = await this.service.listAccountTypes();
    return types.map(t => new AccountTypeResponseDto(t));
  }

  /**
   * Returns details of a specific account type by ID.
   * @param id Unique identifier of the account type.
   * @returns AccountTypeResponseDto.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get account type by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    type: AccountTypeResponseDto,
    description: 'Account type details',
    examples: {
      example: {
        summary: 'Example response',
        value: accountTypeByIdResponseExample,
      }
    }
  })
  async getOne(@Param('id') id: string) {
    const type = await this.service.getAccountType(id);
    return new AccountTypeResponseDto(type);
  }

  /**
   * Creates a new account type.
   * @param dto DTO containing account type creation data.
   * @returns AccountTypeResponseDto.
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new account type' })
  @ApiBody({ type: CreateAccountTypeDto })
  @ApiResponse({ status: 201, type: AccountTypeResponseDto })
  async create(@Body() dto: CreateAccountTypeDto) {
    const type = await this.service.createAccountType(dto);
    return new AccountTypeResponseDto(type);
  }

  /**
   * Updates an existing account type.
   * @param id Unique identifier of the account type.
   * @param dto DTO containing the fields to update.
   * @returns AccountTypeResponseDto.
   */
  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update an account type by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateAccountTypeDto })
  @ApiResponse({ status: 200, type: AccountTypeResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateAccountTypeDto) {
    const type = await this.service.updateAccountType(id, dto);
    return new AccountTypeResponseDto(type);
  }

  /**
   * Deletes an account type by ID.
   * @param id Unique identifier of the account type.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an account type by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string) {
    await this.service.deleteAccountType(id);
  }
}