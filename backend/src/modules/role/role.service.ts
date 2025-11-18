import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { Prisma } from '@prisma/client';

/**
 * Service for handling business logic related to roles.
 */
@Injectable()
export class RoleService {
  constructor(private readonly repo: RoleRepository) {}

  /**
   * Returns all roles.
   * @returns Array of RoleResponseDto
   */
  async listRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.repo.findAll();
    return roles.map(role => new RoleResponseDto(role));
  }

  /**
   * Normalize and validate the name of the role (uppercase, no spaces).
   * @param name Name to normalize and validate.
   * @returns Normalized role name or undefined.
   * @throws BadRequestException if validation fails.
   */
  private normalizeAndValidateName(name?: string): string | undefined {
    if (!name) return undefined;
    const normalized = name.toUpperCase();
    if (normalized.includes(' ')) {
      throw new BadRequestException('Role name must not contain spaces');
    }
    return normalized;
  }

  /**
   * Checks if an error is due to name uniqueness violation in Prisma.
   * @param err Error object.
   * @returns true if it's a name uniqueness error.
   */
  private isNameUniqueError(err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      if (Array.isArray(err.meta?.target)) {
        return err.meta?.target.includes('name');
      }
      return err.meta?.target === 'name';
    }
    return false;
  }

  /**
   * Create a new role.
   * @param data - Data for creation.
   * @returns Created RoleResponseDto.
   * @throws BadRequestException, ConflictException
   */
  async createRole(data: CreateRoleDto): Promise<RoleResponseDto> {
    if (!data.name) throw new BadRequestException('Role name required');
    if (!data.description) throw new BadRequestException('Role description required');
    const name = this.normalizeAndValidateName(data.name)!;
    try {
      const role = await this.repo.create({ name, description: data.description });
      return new RoleResponseDto(role);
    } catch (err) {
      if (this.isNameUniqueError(err)) {
        throw new ConflictException(`Role name "${name}" already exists.`);
      }
      throw err;
    }
  }

  /**
   * Get a role by its ID.
   * @param id - Role identifier.
   * @returns RoleResponseDto.
   * @throws NotFoundException
   */
  async getRole(id: string): Promise<RoleResponseDto> {
    const role = await this.repo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return new RoleResponseDto(role);
  }

  /**
   * Update a role by its ID.
   * @param id - Role identifier.
   * @param data - Update data.
   * @returns Updated RoleResponseDto.
   * @throws NotFoundException, BadRequestException, ConflictException
   */
  async updateRole(id: string, data: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.repo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
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
      return new RoleResponseDto(updated);
    } catch (err) {
      if (this.isNameUniqueError(err)) {
        throw new ConflictException(`Role name "${data.name?.toUpperCase()}" already exists.`);
      }
      throw err;
    }
  }

  /**
   * Delete a role by its ID.
   * @param id - Role identifier.
   * @throws NotFoundException, ConflictException
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.repo.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    try {
      await this.repo.delete(id);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Cannot delete role because it is referenced by existing users. Remove or reassign users before deleting this role.'
        );
      }
      throw err;
    }
  }
}