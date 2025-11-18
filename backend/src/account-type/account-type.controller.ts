import { Controller, Get, Post, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { AccountTypeService } from './account-type.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';

@Controller('account-types')
export class AccountTypeController {
  constructor(private readonly service: AccountTypeService) {}

  @Get()
  @HttpCode(200)
  async findAll() {
    return this.service.listAccountTypes();
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateAccountTypeDto) {
    return this.service.createAccountType(body);
  }

  @Get(':id')
  @HttpCode(200)
  async getById(@Param('id') id: string) {
    return this.service.getAccountType(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.service.deleteAccountType(id);
  }
}