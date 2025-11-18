import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  async list() {
    return this.service.listRoles();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getRole(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateRoleDto) {
    return this.service.createRole(dto);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.updateRole(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.service.deleteRole(id);
  }
}