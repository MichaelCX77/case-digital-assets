import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';

/**
 * Controller for handling role endpoints.
 * Responsável por montar os DTOs de saída antes do envio da resposta.
 */
@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  /**
   * List all roles.
   * @returns Array of RoleResponseDto.
   */
  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  async list() {
    const roles = await this.service.listRoles();
    return roles.map(role => new RoleResponseDto(role));
  }

  /**
   * Retrieves a role by its ID.
   * @param id - ID of the role.
   * @returns RoleResponseDto.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  async getOne(@Param('id') id: string) {
    const role = await this.service.getRole(id);
    return new RoleResponseDto(role);
  }

  /**
   * Creates a new role.
   * @param dto - Role creation data.
   * @returns Created RoleResponseDto.
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.service.createRole(dto);
    return new RoleResponseDto(role);
  }

  /**
   * Updates a role by its ID.
   * @param id - ID of the role.
   * @param dto - Role update data.
   * @returns Updated RoleResponseDto.
   */
  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a role' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const role = await this.service.updateRole(id, dto);
    return new RoleResponseDto(role);
  }

  /**
   * Deletes a role by its ID.
   * @param id - ID of the role.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string) {
    await this.service.deleteRole(id);
  }
}