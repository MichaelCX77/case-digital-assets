import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { UserLinkAccountDto } from '../user-account/dto/user-link-account.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Controller for handling user-related endpoints.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  /**
   * List all users.
   * @returns Array of UserResponseDto.
   */
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll() {
    return this.service.listUsers();
  }

  /**
   * Create a new user.
   * @param body - User data.
   * @returns Created UserResponseDto.
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }

  /**
   * Get user by ID.
   * @param id - User ID.
   * @returns UserResponseDto.
   */
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getById(@Param('id') id: string) {
    return this.service.getUser(id);
  }

  /**
   * Update user information by ID.
   * @param id - User ID.
   * @param body - User update data.
   * @returns Updated UserResponseDto.
   */
  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.service.update(id, body);
  }

  /**
   * Delete user by ID.
   * @param id - User ID.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
  }

  /**
   * List all accounts linked to the user.
   * @param id - User ID.
   * @returns Array of accounts.
   */
  @Get(':id/accounts')
  @HttpCode(200)
  @ApiOperation({ summary: 'List accounts linked to user' })
  @ApiResponse({ status: 200, type: [Object] }) // Replace Object with a DTO if available
  async getAccounts(@Param('id') id: string) {
    return this.service.accounts(id);
  }

  /**
   * Link an account to the user.
   * @param id - User ID.
   * @param body - Account link data.
   */
  @Post(':id/accounts')
  @HttpCode(201)
  @ApiOperation({ summary: 'Link account to user' })
  @ApiBody({ type: UserLinkAccountDto })
  @ApiResponse({ status: 201 })
  async linkAccount(@Param('id') id: string, @Body() body: UserLinkAccountDto) {
    return this.service.linkAccount(id, body);
  }
}