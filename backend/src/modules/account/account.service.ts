import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountRepository } from './account.repository';
import { UserService } from '../user/user.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { AccountUserDto } from './dto/account-user.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus } from './enum/account-status.enum';

/**
 * AccountService
 * 
 * Provides all business logic and operations for accounts. Handles validation,
 * foreign key checks, and user-account associations. All database errors (such as foreign key violations)
 * are caught and returned as friendly BadRequestException messages for the API client. 
 */
@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userService: UserService
  ) {}

  /**
   * Ensures that the account exists and is ACTIVE.
   * Throws if not found or inactive.
   * @param accountId Unique identifier of the account.
   * @throws NotFoundException if account not found.
   * @throws ForbiddenException if the account is inactive.
   */
  async ensureActiveAccount(accountId: string) {
    const acc = await this.accountRepository.findById(accountId);
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.status !== AccountStatus.ACTIVE) throw new ForbiddenException('Inactive accounts cannot be modified');
  }

  /**
   * Lists all accounts in the system.
   * @returns Array of account response DTOs.
   */
  async listAccounts(): Promise<AccountResponseDto[]> {
    const accounts = await this.accountRepository.findAll();
    return accounts.map(acc => new AccountResponseDto(acc));
  }

  /**
   * Creates a new account and assigns its first user.
   * Will throw BadRequestException if required fields are missing or foreign key constraint (P2003) is violated.
   * @param data DTO with account creation data.
   * @returns Account response DTO.
   * @throws BadRequestException if required fields are missing or accountTypeId does not exist.
   */
  async createAccount(data: CreateAccountDto): Promise<AccountResponseDto> {
    if (!data.userId) throw new BadRequestException('User id required');
    if (!data.accountTypeId) throw new BadRequestException('accountTypeId required');
    await this.userService.getUser(data.userId);

    try {
      const account = await this.accountRepository.create({
        balance: 10,
        accountTypeId: data.accountTypeId
      });

      await this.accountRepository.addUser(account.idAccount, data.userId);

      return new AccountResponseDto(account);
    } catch (error) {
      // Prisma foreign key violation: P2003
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('The provided accountTypeId does not exist. Please provide a valid accountTypeId.');
      }
      // Handle other Prisma errors here if necessary
      throw error;
    }
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
   * Throws if account does not exist or is not active.
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
   * Throws if account or user does not exist, or account is inactive.
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
   * Removes a user from an account. Cannot remove the last user from the account.
   * Throws if user not linked to the account or if it would be the last remaining user.
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
   * If a foreign key constraint is violated, a BadRequestException is returned.
   * @param id Unique identifier of the account.
   * @param data DTO with fields to update.
   * @returns Updated account response DTO.
   * @throws NotFoundException if account not found.
   * @throws ForbiddenException if account is inactive and trying to update without activation.
   * @throws BadRequestException if related fields violate foreign key constraint.
   */
  async updateAccount(id: string, data: UpdateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');

    try {
      // If inactive, only allow activation
      if (account.status === AccountStatus.INACTIVE) {
        if (!data.status || data.status !== AccountStatus.ACTIVE) {
          throw new ForbiddenException('Inactive accounts can only be activated (status set to ACTIVE)');
        }
        // Allow any field update as long as status is ACTIVE
        const updated = await this.accountRepository.update(id, data);
        return new AccountResponseDto(updated);
      }

      // Active accounts allow normal updates
      const updated = await this.accountRepository.update(id, data);
      return new AccountResponseDto(updated);

    } catch (error) {
      // Prisma foreign key violation: P2003
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('accountTypeId does not exist. Please provide a valid accountTypeId.');
      }
      // Handle other Prisma errors here if necessary
      throw error;
    }
  }
}