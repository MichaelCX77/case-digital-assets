import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AccountRepository } from './account.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus } from './enum/account-status.enum';
import { AccountLinkUserDto } from '../user-account/dto/account-link-user.dto';
import { UserRepository } from '../user/user.repository';

/**
 * AccountService
 *
 * Implements business logic for accounts, such as validation, foreign key checks,
 * and user-account associations. Returns raw database models, and controllers are responsible for formatting responses.
 */
@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository
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
   * @returns Array of raw account models
   */
  async listAccounts() {
    return this.accountRepository.findAll();
  }

  /**
   * Creates a new account and assigns its first user.
   * @param data DTO with account creation data
   * @returns Raw account model
   */
  async createAccount(data: CreateAccountDto) {
    if (!data.userId) throw new BadRequestException('User id required');
    if (!data.accountTypeId) throw new BadRequestException('accountTypeId required');
    await this.userRepository.findById(data.userId);

    try {
      const account = await this.accountRepository.create({
        balance: 10,
        accountTypeId: data.accountTypeId
      });

      await this.accountRepository.addUser(account.idAccount, data.userId);

      return account;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('The provided accountTypeId does not exist. Please provide a valid accountTypeId.');
      }
      throw error;
    }
  }

  /**
   * Gets account details by ID.
   * @param id Unique identifier of the account.
   * @returns Raw account model.
   * @throws NotFoundException if account not found.
   */
  async getAccount(id: string) {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  /**
   * Lists all users linked to an account.
   * Throws if account does not exist or is not active.
   * @param accountId Unique identifier of the account.
   * @returns Array of user details for the account (plain objects).
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
   * @returns The new user-account link (raw model).
   */
  async addUserToAccount(accountId: string, dto: AccountLinkUserDto) {
    await this.ensureActiveAccount(accountId);

    await this.userRepository.findById(dto.userId);

    return this.accountRepository.addUser(accountId, dto.userId);
  }

  /**
   * Removes a user from an account. 
   * Cannot remove the last user from the account.
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
   * Only ACTIVE accounts can be updated. Inactive accounts must be activated first.
   * @param id Unique identifier of the account.
   * @param data DTO with fields to update.
   * @returns Updated raw account model.
   * @throws NotFoundException if account not found.
   * @throws ForbiddenException if account is inactive and not being activated.
   * @throws BadRequestException if related fields violate foreign key constraint.
   */
  async updateAccount(id: string, data: UpdateAccountDto) {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');

    try {
      if (account.status === AccountStatus.INACTIVE) {
        if (!data.status || data.status !== AccountStatus.ACTIVE) {
          throw new ForbiddenException('Inactive accounts can only be activated (status set to ACTIVE)');
        }
        return await this.accountRepository.update(id, data);
      }
      return await this.accountRepository.update(id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('accountTypeId does not exist. Please provide a valid accountTypeId.');
      }
      throw error;
    }
  }
}