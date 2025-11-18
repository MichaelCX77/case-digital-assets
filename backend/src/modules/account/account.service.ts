import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { UserService } from '../user/user.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { AccountUserDto } from './dto/account-user.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

/**
 * Service providing business logic and operations for accounts.
 */
@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userService: UserService
  ) {}

  /**
   * Throws if the account does not exist or is inactive.
   * @param accountId Unique identifier of the account.
   * @throws NotFoundException if account not found.
   * @throws ForbiddenException if the account is inactive.
   */
  async ensureActiveAccount(accountId: string) {
    const acc = await this.accountRepository.findById(accountId);
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.status !== 'ACTIVE') throw new ForbiddenException('Inactive accounts cannot be modified');
  }

  /**
   * Lists all accounts.
   * @returns Array of account response DTOs.
   */
  async listAccounts(): Promise<AccountResponseDto[]> {
    const accounts = await this.accountRepository.findAll();
    return accounts.map(acc => new AccountResponseDto(acc));
  }

  /**
   * Creates a new account and assigns its first user.
   * @param data DTO with account creation data.
   * @returns Account response DTO.
   * @throws BadRequestException if required fields are missing.
   */
  async createAccount(data: CreateAccountDto): Promise<AccountResponseDto> {
    if (!data.userId) throw new BadRequestException('User id required');
    if (!data.accountTypeId) throw new BadRequestException('accountTypeId required');
    await this.userService.getUser(data.userId);

    const account = await this.accountRepository.create({
      balance: 10,
      accountTypeId: data.accountTypeId,
      status: data.status ?? 'INACTIVE'
    });

    await this.accountRepository.addUser(account.idAccount, data.userId);

    return new AccountResponseDto(account);
  }

  /**
   * Gets account details by ID.
   * @param id Unique identifier of the account.
   * @returns Account response DTO.
   * @throws NotFoundException if account not found.
   */
  async getAccount(id: string): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');
    return new AccountResponseDto(account);
  }

  /**
   * Lists all users linked to an account.
   * @param accountId Unique identifier of the account.
   * @returns Array of user details for the account.
   * @throws NotFoundException if account not found.
   * @throws ForbiddenException if account is inactive.
   */
  async listAccountUsers(accountId: string) {
    await this.ensureActiveAccount(accountId);
    const links = await this.accountRepository.listUsers(accountId);
    return links.map(link => ({
      id: link.user.id,
      name: link.user.name,
      email: link.user.email,
      role: link.user.role,
      createdAt: link.user.createdAt,
      updatedAt: link.user.updatedAt,
    }));
  }

  /**
   * Adds a user to an account.
   * @param accountId Unique identifier of the account.
   * @param dto DTO with user information.
   * @returns The user-account link.
   * @throws NotFoundException if account or user not found.
   * @throws ForbiddenException if account is inactive.
   */
  async addUserToAccount(accountId: string, dto: AccountUserDto) {
    await this.ensureActiveAccount(accountId);

    await this.userService.getUser(dto.userId);

    return this.accountRepository.addUser(accountId, dto.userId);
  }

  /**
   * Removes a user from an account. Cannot remove the last user.
   * @param accountId Unique identifier of the account.
   * @param userId Unique identifier of the user.
   * @throws NotFoundException if user is not linked to the account.
   * @throws BadRequestException if trying to remove the last user.
   */
  async removeUserFromAccount(accountId: string, userId: string): Promise<void> {
    await this.ensureActiveAccount(accountId);

    const links = await this.accountRepository.listUsers(accountId);
    if (!links.find(link => link.user.id === userId)) {
      throw new NotFoundException('User not linked to account');
    }

    if (links.length <= 1) {
      throw new BadRequestException('Cannot remove the last user from the account - try inactivating the account instead.');
    }

    await this.accountRepository.removeUser?.(accountId, userId);
  }

  /**
   * Updates an account.
   * Inactive accounts can only be activated (status set to ACTIVE) before updating.
   * @param id Unique identifier of the account.
   * @param data DTO with fields to update.
   * @returns Updated account response DTO.
   * @throws NotFoundException if account not found.
   * @throws ForbiddenException if account is inactive and trying to update without activation.
   */
  async updateAccount(id: string, data: UpdateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');

    // If inactive, only allow activation
    if (account.status === 'INACTIVE') {
      if (!data.status || data.status !== 'ACTIVE') {
        throw new ForbiddenException('Inactive accounts can only be activated (status set to ACTIVE)');
      }
      // Allow any field update as long as status is ACTIVE
      const updated = await this.accountRepository.update(id, data);
      return new AccountResponseDto(updated);
    }

    // Active accounts allow normal updates
    const updated = await this.accountRepository.update(id, data);
    return new AccountResponseDto(updated);
  }
}