import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { AccountTypeService } from './account-type.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';

@Controller('account-types')
export class AccountTypeController {
  constructor(private readonly service: AccountTypeService) {}

  @Get()
  async list() {
    return this.service.listAccountTypes();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getAccountType(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAccountTypeDto) {
    return this.service.createAccountType(dto);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() dto: UpdateAccountTypeDto) {
    return this.service.updateAccountType(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.service.deleteAccountType(id);
  }
}