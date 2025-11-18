import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { VincularContaDto } from './dto/vincular-conta.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('clientes')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  async findAll() {
    return this.service.listUsers();
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getUser(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Get(':id/contas')
  async getContas(@Param('id') id: string) {
    return this.service.contas(id);
  }

  @Post(':id/contas')
  async vincularConta(@Param('id') id: string, @Body() body: VincularContaDto) {
    return this.service.vincularConta(id, body);
  }
}