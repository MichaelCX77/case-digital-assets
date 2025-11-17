import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VincularContaDto } from './dto/vincular-conta.dto';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async listUsers(): Promise<UserResponseDto[]> {
    const users = await this.repo.findAll();
    return users.map(u => new UserResponseDto(u));
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    if (!data) throw new BadRequestException("Dados não recebidos!");
    const exists = await this.repo.findByEmail(data.email);
    if (exists) throw new BadRequestException("Email já cadastrado");
    const user = await this.repo.create(data);
    return new UserResponseDto(user);
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException("Cliente não encontrado");
    return new UserResponseDto(user);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    await this.getUser(id); // valida existência
    const user = await this.repo.update(id, data);
    return new UserResponseDto(user);
  }

  async delete(id: string): Promise<UserResponseDto> {
    const user = await this.getUser(id); // retorna o antigo antes de deletar
    await this.repo.delete(id);
    return user;
  }

  async contas(userId: string): Promise<any[]> {
    await this.getUser(userId); // valida existência
    return this.repo.listContas(userId);
  }

  async vincularConta(userId: string, dto: VincularContaDto): Promise<any> {
    await this.getUser(userId);
    return this.repo.vincularConta(userId, dto.accountId);
  }

  async getRoleNames(email: string): Promise<string[]> {
    const roleName = await this.repo.findRoleNameByEmail(email);
    return roleName ? [roleName] : [];
  }
}