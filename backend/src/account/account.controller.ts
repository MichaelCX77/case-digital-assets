import { Controller, Get, Post, Delete, Param, Body, HttpCode, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountUserDto } from './dto/account-user.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Get()
  @HttpCode(200)
  async findAll() {
    return this.service.listAccounts();
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateAccountDto) {
    return this.service.createAccount(body);
  }

  @Get(':id')
  @HttpCode(200)
  async getById(@Param('id') id: string) {
    return this.service.getAccount(id);
  }

  @Get(':id/users')
  @HttpCode(200)
  async getUsers(@Param('id') id: string) {
    return this.service.listAccountUsers(id);
  }

  @Post(':id/users')
  @HttpCode(201)
  async addUser(@Param('id') id: string, @Body() body: AccountUserDto) {
    return this.service.addUserToAccount(id, body);
  }

  @Delete(':id/users/:userId')
  @HttpCode(204)
  async removeUser(
    @Param('id') accountId: string,
    @Param('userId') userId: string
  ) {
    await this.service.removeUserFromAccount(accountId, userId);
  }

  @Put(':id')
  @HttpCode(200)
  async updateAccount(@Param('id') id: string, @Body() body: UpdateAccountDto) {
    return this.service.updateAccount(id, body);
  }

}

