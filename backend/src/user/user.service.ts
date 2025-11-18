import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LinkAccountDto } from './dto/link-account.dto';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async listUsers(): Promise<UserResponseDto[]> {
    const users = await this.repo.findAll();
    return users.map(u => new UserResponseDto(u));
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    if (!data) throw new BadRequestException("Data not received!");
    const exists = await this.repo.findByEmail(data.email);
    if (exists) throw new BadRequestException("Email already registered");
    const user = await this.repo.create(data);
    return new UserResponseDto(user);
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return new UserResponseDto(user);
  }

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

  async delete(id: string): Promise<UserResponseDto> {
    const user = await this.getUser(id); // return the old record before deletion
    await this.repo.delete(id);
    return user;
  }

  async accounts(userId: string): Promise<any[]> {
    await this.getUser(userId); // check existence
    return this.repo.listAccounts(userId);
  }

  async linkAccount(userId: string, dto: LinkAccountDto): Promise<any> {
    await this.getUser(userId);
    return this.repo.linkAccount(userId, dto.accountId);
  }

  async getRoleNames(email: string): Promise<string[]> {
    const roleName = await this.repo.findRoleNameByEmail(email);
    return roleName ? [roleName] : [];
  }
}