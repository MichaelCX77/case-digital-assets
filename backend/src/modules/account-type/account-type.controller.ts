import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { AccountTypeService } from './account-type.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';

/**
 * Controller handling account type-related operations.
 */
@Controller('account-types')
export class AccountTypeController {
  constructor(private readonly service: AccountTypeService) {}

  /**
   * Returns a list of all account types.
   */
  @Get()
  async list() {
    return this.service.listAccountTypes();
  }

  /**
   * Returns details of a specific account type by ID.
   * @param id Unique identifier of the account type.
   */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getAccountType(id);
  }

  /**
   * Creates a new account type.
   * @param dto DTO containing account type creation data.
   */
  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAccountTypeDto) {
    return this.service.createAccountType(dto);
  }

  /**
   * Updates an existing account type.
   * @param id Unique identifier of the account type.
   * @param dto DTO containing the fields to update.
   */
  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() dto: UpdateAccountTypeDto) {
    return this.service.updateAccountType(id, dto);
  }

  /**
   * Deletes an account type by ID.
   * @param id Unique identifier of the account type.
   */
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.service.deleteAccountType(id);
  }
}