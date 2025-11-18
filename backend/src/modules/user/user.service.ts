import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LinkAccountDto } from './dto/link-account.dto';

/**
 * Service for handling business logic related to users.
 */
@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  /**
   * Returns all users.
   * @returns Array of UserResponseDto.
   */
  async listUsers(): Promise<UserResponseDto[]> {
    const users = await this.repo.findAll();
    return users.map(u => new UserResponseDto(u));
  }

  /**
   * Create a new user.
   * @param data - Data for creation.
   * @returns Created UserResponseDto.
   * @throws BadRequestException if data not received or email already registered.
   */
  async create(data: CreateUserDto): Promise<UserResponseDto> {
    if (!data) throw new BadRequestException("Data not received!");
    const exists = await this.repo.findByEmail(data.email);
    if (exists) throw new BadRequestException("Email already registered");
    const user = await this.repo.create(data);
    return new UserResponseDto(user);
  }

  /**
   * Get a user by their ID.
   * @param id - User identifier.
   * @returns UserResponseDto.
   * @throws NotFoundException if user not found.
   */
  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return new UserResponseDto(user);
  }

  /**
   * Update a user by their ID.
   * @param id - User identifier.
   * @param data - Update data.
   * @returns Updated UserResponseDto.
   * @throws BadRequestException if email already registered (to another user).
   */
  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    await this.getUser(id); // check existence

    // Validate email uniqueness if it's being updated
    if (data.email) {
      const existingUser = await this.repo.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException("Email already registered");
      }
    }

    const user = await this.repo.update(id, data);
    return new UserResponseDto(user);
  }

  /**
   * Delete a user by ID.
   * @param id - User identifier.
   * @returns Deleted UserResponseDto (old record).
   */
  async delete(id: string): Promise<UserResponseDto> {
    const user = await this.getUser(id); // return the old record before deletion
    await this.repo.delete(id);
    return user;
  }

  /**
   * Get all accounts linked to a user.
   * @param userId - User identifier.
   * @returns Array of accounts.
   * @throws NotFoundException if user not found.
   */
  async accounts(userId: string): Promise<any[]> {
    await this.getUser(userId); // check existence
    return this.repo.listAccounts(userId);
  }

  /**
   * Link an account to a user.
   * @param userId - User identifier.
   * @param dto - Account link data.
   * @returns Link record.
   * @throws NotFoundException if user not found.
   */
  async linkAccount(userId: string, dto: LinkAccountDto): Promise<any> {
    await this.getUser(userId);
    return this.repo.linkAccount(userId, dto.accountId);
  }

  /**
   * Get role names for a user by email.
   * @param email - User email.
   * @returns Array containing the role name if found.
   */
  async getRoleNames(email: string): Promise<string[]> {
    const roleName = await this.repo.findRoleNameByEmail(email);
    return roleName ? [roleName] : [];
  }
}