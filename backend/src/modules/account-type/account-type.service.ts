import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { AccountTypeRepository } from './account-type.repository';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { Prisma } from '@prisma/client';

/**
 * Service providing business logic and operations for account types.
 * Returns raw account type models; controllers are responsible for assembling DTOs for API output.
 */
@Injectable()
export class AccountTypeService {
  constructor(private readonly repo: AccountTypeRepository) {}

  /**
   * Lists all account types.
   * @returns Array of account type models.
   */
  async listAccountTypes() {
    return this.repo.findAll();
  }

  /**
   * Normalizes and validates account type name (uppercase, no spaces).
   * @param name Account type name to normalize.
   * @returns Normalized name or undefined.
   * @throws BadRequestException if name contains spaces.
   */
  private normalizeAndValidateName(name?: string): string | undefined {
    if (!name) return undefined;
    const normalized = name.toUpperCase();
    if (normalized.includes(' ')) {
      throw new BadRequestException('Account type name must not contain spaces');
    }
    return normalized;
  }

  /**
   * Checks if error is a Prisma unique constraint violation on the 'name' field.
   * @param err Error object.
   * @returns True if error is unique violation, false otherwise.
   */
  private isNameUniqueError(err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      if (Array.isArray(err.meta?.target)) {
        return err.meta?.target.includes('name');
      }
      return err.meta?.target === 'name';
    }
    return false;
  }

  /**
   * Creates a new account type.
   * @param data DTO containing account type creation data.
   * @returns Account type model.
   * @throws BadRequestException if required fields are missing or invalid.
   * @throws ConflictException if account type name already exists.
   */
  async createAccountType(data: CreateAccountTypeDto) {
    if (!data.name) throw new BadRequestException('Account type name required');
    if (!data.description) throw new BadRequestException('Account type description required');
    const name = this.normalizeAndValidateName(data.name)!;
    try {
      return await this.repo.create({ name, description: data.description });
    } catch (err) {
      if (this.isNameUniqueError(err)) {
        throw new ConflictException(`Account type name "${name}" already exists.`);
      }
      throw err;
    }
  }

  /**
   * Gets account type details by ID.
   * @param id Unique identifier of the account type.
   * @returns Account type model.
   * @throws NotFoundException if account type not found.
   */
  async getAccountType(id: string) {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException('AccountType not found');
    return type;
  }

  /**
   * Updates account type fields.
   * @param id Unique identifier of the account type.
   * @param data DTO with fields to update.
   * @returns Updated account type model.
   * @throws NotFoundException if account type not found.
   * @throws BadRequestException if no fields are provided.
   * @throws ConflictException if name already exists.
   */
  async updateAccountType(id: string, data: UpdateAccountTypeDto) {
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
      return await this.repo.update(id, {
        ...(name ? { name } : {}),
        ...(data.description ? { description: data.description } : {}),
      });
    } catch (err) {
      if (this.isNameUniqueError(err)) {
        throw new ConflictException(`Account type name "${data.name?.toUpperCase()}" already exists.`);
      }
      throw err;
    }
  }

  /**
   * Deletes an account type by ID.
   * @param id Unique identifier of the account type.
   * @throws NotFoundException if account type not found.
   * @throws ConflictException if type is referenced by existing accounts.
   */
  async deleteAccountType(id: string): Promise<void> {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException('AccountType not found');
    try {
      await this.repo.delete(id);
    } catch (err) {
      // Prisma P2003 - Constraint violation (referenced by accounts)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException(
          'Account type cannot be deleted because it is referenced by existing accounts. Remove or re-assign dependent accounts before deleting this account type.'
        );
      }
      throw err;
    }
  }
}