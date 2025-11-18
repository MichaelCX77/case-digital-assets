import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { AccountTypeRepository } from './account-type.repository';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { AccountTypeResponseDto } from './dto/account-type-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountTypeService {
  constructor(private readonly repo: AccountTypeRepository) {}

  async listAccountTypes(): Promise<AccountTypeResponseDto[]> {
    const types = await this.repo.findAll();
    return types.map(t => new AccountTypeResponseDto(t));
  }

  private normalizeAndValidateName(name?: string): string | undefined {
    if (!name) return undefined;
    const normalized = name.toUpperCase();
    if (normalized.includes(' ')) {
      throw new BadRequestException('Account type name must not contain spaces');
    }
    return normalized;
  }

  private isNameUniqueError(err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      if (Array.isArray(err.meta?.target)) {
        return err.meta?.target.includes('name');
      }
      return err.meta?.target === 'name';
    }
    return false;
  }

  async createAccountType(data: CreateAccountTypeDto): Promise<AccountTypeResponseDto> {
    if (!data.name) throw new BadRequestException('Account type name required');
    if (!data.description) throw new BadRequestException('Account type description required');
    const name = this.normalizeAndValidateName(data.name)!;
    try {
      const type = await this.repo.create({ name, description: data.description });
      return new AccountTypeResponseDto(type);
    } catch (err) {
      if (this.isNameUniqueError(err)) {
        throw new ConflictException(`Account type name "${name}" already exists.`);
      }
      throw err;
    }
  }

  async getAccountType(id: string): Promise<AccountTypeResponseDto> {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException('AccountType not found');
    return new AccountTypeResponseDto(type);
  }

  async updateAccountType(id: string, data: UpdateAccountTypeDto): Promise<AccountTypeResponseDto> {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException('AccountType not found');
    let name: string | undefined;
    if (data.name !== undefined) {
      name = this.normalizeAndValidateName(data.name);
    }
    if (!name && !data.description) {
      throw new BadRequestException('At least one field (name or description) must be provided for update');
    }
    try {
      const updated = await this.repo.update(id, {
        ...(name ? { name } : {}),
        ...(data.description ? { description: data.description } : {}),
      });
      return new AccountTypeResponseDto(updated);
    } catch (err) {
      if (this.isNameUniqueError(err)) {
        throw new ConflictException(`Account type name "${data.name?.toUpperCase()}" already exists.`);
      }
      throw err;
    }
  }

  async deleteAccountType(id: string): Promise<void> {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException('AccountType not found');
    try {
      await this.repo.delete(id);
    } catch (err) {
      // Prisma P2003 - Violação de constraint
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException(
          'Account type cannot be deleted because it is referenced by existing accounts. Remove or re-assign dependent accounts before deleting this account type.'
        );
      }
      throw err;
    }
  }
}