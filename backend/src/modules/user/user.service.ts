import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserLinkAccountDto } from '../user-account/dto/user-link-account.dto';
import { RoleRepository } from '../role/role.repository';

/**
 * Service for handling business logic related to users.
 * Returns raw user models. Controller is responsible for assembling response DTOs.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly roleRepo: RoleRepository
  ) {}

  /**
   * Returns all users.
   * @returns Array of user models.
   */
  async listUsers() {
    return this.repo.findAll();
  }

  /**
   * Creates a new user.
   * @param data - Data for creation.
   * @returns User model.
   * @throws BadRequestException if data not received, email already registered or roleId does not exist.
   */
  async create(data: CreateUserDto) {
    if (!data) throw new BadRequestException("Data not received!");

    const exists = await this.repo.findByEmail(data.email);
    if (exists) throw new BadRequestException("Email already registered");

    const roleExists = await this.roleRepo.roleExists(data.roleId);
    if (!roleExists) throw new BadRequestException("Provided roleId does not exist!");

    return this.repo.create(data);
  }

  /**
   * Gets a user by their ID.
   * @param id - User identifier.
   * @returns User model.
   * @throws NotFoundException if user not found.
   */
  async getUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  /**
   * Updates a user by their ID.
   * @param id - User identifier.
   * @param data - Update data.
   * @returns Updated user model.
   * @throws BadRequestException if email already registered (to another user) or roleId does not exist.
   */
  async update(id: string, data: UpdateUserDto) {
    await this.getUser(id); // Check existence

    // Email uniqueness validation
    if (data.email) {
      const existingUser = await this.repo.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException("Email already registered");
      }
    }

    // Role existence validation (if updating role)
    if (data.roleId) {
      const roleExists = await this.roleRepo.roleExists(data.roleId);
      if (!roleExists) throw new BadRequestException("Provided roleId does not exist!");
    }

    return this.repo.update(id, data);
  }

  /**
   * Deletes a user by ID.
   * @param id - User identifier.
   * @returns Deleted user model (previous record).
   */
  async delete(id: string) {
    const user = await this.getUser(id); // Get record before deletion
    await this.repo.delete(id);
    return user;
  }

  /**
   * Returns all accounts linked to a given user.
   * @param userId - User identifier.
   * @returns Array of accounts.
   * @throws NotFoundException if user not found.
   */
  async accounts(userId: string) {
    await this.getUser(userId); // Check existence
    return this.repo.listAccounts(userId);
  }

  /**
   * Links an account to a user.
   * @param userId - User identifier.
   * @param dto - Account link data.
   * @returns Link record.
   * @throws NotFoundException if user not found.
   */
  async linkAccount(userId: string, dto: UserLinkAccountDto) {
    await this.getUser(userId);
    return this.repo.linkAccount(userId, dto.accountId);
  }

  /**
   * Gets role names for a user by email.
   * @param email - User email.
   * @returns Array containing the role name if found.
   */
  async getRoleNames(email: string): Promise<string[]> {
    const roleName = await this.repo.findRoleNameByEmail(email);
    return roleName ? [roleName] : [];
  }

  /**
   * Gets role names for a user by ID.
   * @param id - User identifier.
   * @returns Array containing the role name if found.
   */
  async getRoleNamesById(id: string): Promise<string[]> {
    const user = await this.repo.findById(id);
    return user?.role ? [user.role.name] : [];
  }
}