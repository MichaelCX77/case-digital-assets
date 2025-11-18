import { Controller, Get, Post, Delete, Param, Body, HttpCode, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountUserDto } from './dto/account-user.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

/**
 * Controller handling account-related operations.
 */
@Controller('accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  /**
   * Returns a list of all accounts.
   */
  @Get()
  @HttpCode(200)
  async findAll() {
    return this.service.listAccounts();
  }

  /**
   * Creates a new account.
   * @param body DTO containing account creation data.
   */
  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateAccountDto) {
    return this.service.createAccount(body);
  }

  /**
   * Returns details of an account by ID.
   * @param id Unique identifier of the account.
   */
  @Get(':id')
  @HttpCode(200)
  async getById(@Param('id') id: string) {
    return this.service.getAccount(id);
  }

  /**
   * Lists all users of the specified account.
   * @param id Unique identifier of the account.
   */
  @Get(':id/users')
  @HttpCode(200)
  async getUsers(@Param('id') id: string) {
    return this.service.listAccountUsers(id);
  }

  /**
   * Adds a user to the specified account.
   * @param id Unique identifier of the account.
   * @param body DTO containing user information.
   */
  @Post(':id/users')
  @HttpCode(201)
  async addUser(@Param('id') id: string, @Body() body: AccountUserDto) {
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
   */
  @Put(':id')
  @HttpCode(200)
  async updateAccount(@Param('id') id: string, @Body() body: UpdateAccountDto) {
    return this.service.updateAccount(id, body);
  }
}