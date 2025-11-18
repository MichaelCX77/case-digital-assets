import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { LinkAccountDto } from './dto/link-account.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @HttpCode(200)
  async findAll() {
    return this.service.listUsers();
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }

  @Get(':id')
  @HttpCode(200)
  async getById(@Param('id') id: string) {
    return this.service.getUser(id);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
  }

  @Get(':id/accounts')
  @HttpCode(200)
  async getAccounts(@Param('id') id: string) {
    return this.service.accounts(id);
  }

  @Post(':id/accounts')
  @HttpCode(201)
  async linkAccount(@Param('id') id: string, @Body() body: LinkAccountDto) {
    return this.service.linkAccount(id, body);
  }
}