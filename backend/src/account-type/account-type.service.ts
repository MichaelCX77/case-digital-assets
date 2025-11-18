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

  async createAccountType(data: CreateAccountTypeDto): Promise<AccountTypeResponseDto> {
    if (!data.name) throw new BadRequestException('Account type name required');
    if (!data.description) throw new BadRequestException('Account type description required');
    const type = await this.repo.create(data);
    return new AccountTypeResponseDto(type);
  }

  async getAccountType(id: string): Promise<AccountTypeResponseDto> {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException('AccountType not found');
    return new AccountTypeResponseDto(type);
  }

  async updateAccountType(id: string, data: UpdateAccountTypeDto): Promise<AccountTypeResponseDto> {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException('AccountType not found');
    // Ao editar, pode querer validar se nome ou descrição não vazios (opcional)
    if (!data.name && !data.description) {
      throw new BadRequestException('At least one field (name or description) must be provided for update');
    }
    const updated = await this.repo.update(id, data);
    return new AccountTypeResponseDto(updated);
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