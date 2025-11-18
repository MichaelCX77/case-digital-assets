import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { UserService } from '../user/user.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { AccountUserDto } from './dto/account-user.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userService: UserService
  ) {}

  async ensureActiveAccount(accountId: string) {
    const acc = await this.accountRepository.findById(accountId);
    if (!acc) throw new NotFoundException('Account not found');
    if (acc.status !== 'ACTIVE') throw new ForbiddenException('Inactive accounts cannot be modified');
  }

  async listAccounts(): Promise<AccountResponseDto[]> {
    const accounts = await this.accountRepository.findAll();
    return accounts.map(acc => new AccountResponseDto(acc));
  }

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

  async getAccount(id: string): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');
    return new AccountResponseDto(account);
  }

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

  async addUserToAccount(accountId: string, dto: AccountUserDto) {
    await this.ensureActiveAccount(accountId);

    await this.userService.getUser(dto.userId);

    return this.accountRepository.addUser(accountId, dto.userId);
  }

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

  async updateAccount(id: string, data: UpdateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');

    // Se está INATIVA, só permite update se status for enviado como ACTIVE
    if (account.status === 'INACTIVE') {
      if (!data.status || data.status !== 'ACTIVE') {
        throw new ForbiddenException('Inactive accounts can only be activated (status set to ACTIVE)');
      }
      // Permite atualizar qualquer campo, desde que status seja ACTIVE
      const updated = await this.accountRepository.update(id, data);
      return new AccountResponseDto(updated);
    }

    // Se está ATIVA, permite alteração normal
    const updated = await this.accountRepository.update(id, data);
    return new AccountResponseDto(updated);
  }
}