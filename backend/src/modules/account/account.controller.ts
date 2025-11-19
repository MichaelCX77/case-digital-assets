import { Controller, Get, Post, Delete, Param, Body, HttpCode, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountLinkUserDto } from '../user-account/dto/account-link-user.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
 import { accountsResponseExample, accountByIdResponseExample, accountUsersResponseExample } from './swagger/account.swagger-example';
import { ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../user/dto/user-response.dto';

/**
 * Controller handling account-related operations.
 * Responsible for assembling output DTOs from the raw models returned by AccountService.
 */


@Controller('accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  /**
   * Returns a list of all accounts.
   * @returns Array of AccountResponseDto
   */
  @ApiResponse({
    status: 200,
    type: [AccountResponseDto],
    description: 'Array of accounts',
    examples: {
      example: {
        summary: 'Example response',
        value: accountsResponseExample,
      }
    }
  })
  @Get()
  @HttpCode(200)
  async findAll() {
    const accounts = await this.service.listAccounts();
    return accounts.map(acc => new AccountResponseDto(acc));
  }

  /**
   * Creates a new account.
   * @param body DTO containing account creation data.
   * @returns AccountResponseDto
   */
  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateAccountDto) {
    const account = await this.service.createAccount(body);
    return new AccountResponseDto(account);
  }

  /**
   * Returns details of an account by ID.
   * @param id Unique identifier of the account.
   * @returns AccountResponseDto
   */
  @ApiResponse({
    status: 200,
    type: AccountResponseDto,
    description: 'Account details',
    examples: {
      example: {
        summary: 'Example response',
        value: accountByIdResponseExample,
      }
    }
  })
  @Get(':id')
  @HttpCode(200)
  async getById(@Param('id') id: string) {
    const account = await this.service.getAccount(id);
    return new AccountResponseDto(account);
  }

  /**
   * Lists all users of the specified account.
   * @param id Unique identifier of the account.
   * @returns Array of plain user details
   */
  @ApiResponse({
    status: 200,
    description: 'Array of users linked to the account',
    type: [UserResponseDto], // Ou o tipo correto do DTO do usuário
    examples: {
      example: {
        summary: 'Example response',
        value: accountUsersResponseExample,
      }
    }
  })
  @Get(':id/users')
  @HttpCode(200)
  async getUsers(@Param('id') id: string) {
    return this.service.listAccountUsers(id);
  }

  /**
   * Adds a user to the specified account.
   * @param id Unique identifier of the account.
   * @param body DTO containing user information.
   * @returns The user-account link object (plain model)
   */
  @Post(':id/users')
  @HttpCode(201)
  async addUser(@Param('id') id: string, @Body() body: AccountLinkUserDto) {
    return this.service.addUserToAccount(id, body);
  }

  /**
   * Removes a user from the specified account.
   * @param accountId Unique identifier of the account.
   * @param userId Unique identifier of the user to remove.
   */
  @Delete(':id/users/:userId')
  @HttpCode(204)
  async removeUser(
    @Param('id') accountId: string,
    @Param('userId') userId: string
  ) {
    await this.service.removeUserFromAccount(accountId, userId);
  }

  /**
   * Updates details of the specified account.
   * @param id Unique identifier of the account.
   * @param body DTO containing updated data.
   * @returns Updated AccountResponseDto
   */
  @Put(':id')
  @HttpCode(200)
  async updateAccount(@Param('id') id: string, @Body() body: UpdateAccountDto) {
    const account = await this.service.updateAccount(id, body);
    return new AccountResponseDto(account);
  }
}