import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { AccountRepository } from '../account/account.repository';
import { AccountStatus } from '../account/enum/account-status.enum';

/**
 * Service that centralizes business logic for managing User-Account links (N:N association).
 * Used by both user and account controllers to perform association operations.
 * Returns raw models; controllers are responsible for assembling response DTOs.
 */
@Injectable()
export class UserAccountService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  /**
   * Links a user to an account (creates user-account association).
   * @param accountId - Account unique identifier.
   * @param userId - User unique identifier.
   * @returns Raw association record (depends on repository).
   * @throws NotFoundException if user or account not found, or account is inactive.
   * @throws ForbiddenException if account is inactive.
   */
  async linkUserToAccount(accountId: string, userId: string) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== AccountStatus.ACTIVE) throw new ForbiddenException('Inactive accounts cannot be edited');

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.accountRepository.addUser(accountId, userId);
  }

  /**
   * Removes a user-account association.
   * @param accountId - Account unique identifier.
   * @param userId - User unique identifier.
   * @returns void.
   * @throws NotFoundException if user, account, or association not found.
   * @throws ForbiddenException if account is inactive.
   * @throws BadRequestException if trying to remove the last user from the account.
   */
  async unlinkUserFromAccount(accountId: string, userId: string): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== AccountStatus.ACTIVE) throw new ForbiddenException('Inactive accounts cannot be edited');
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const links = await this.accountRepository.listUsers(accountId);
    if (!links.find(link => link.user.id === userId)) {
      throw new NotFoundException('User not linked to account');
    }
    if (links.length <= 1) {
      throw new BadRequestException('Cannot remove the last user from the account - try inactivating instead');
    }
    await this.accountRepository.removeUser(accountId, userId);
  }

  /**
   * Lists all accounts linked to the given user.
   * @param userId - User unique identifier.
   * @returns Array of account models.
   * @throws NotFoundException if user not found.
   */
  async listAccountsForUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.listAccounts(userId);
  }

  /**
   * Lists all users linked to the given account.
   * @param accountId - Account unique identifier.
   * @returns Array of user models.
   * @throws NotFoundException if account not found.
   * @throws ForbiddenException if account is inactive.
   */
  async listUsersForAccount(accountId: string) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');
    if (account.status !== AccountStatus.ACTIVE) throw new ForbiddenException('Inactive accounts cannot be listed');
    return this.accountRepository.listUsers(accountId);
  }
}