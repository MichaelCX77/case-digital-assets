import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getRoleNames(email: string): Promise<string[]> {
    const user = await this.repo.findByEmail(email);
    if (user && user.role) {
      return [user.role.name];
    }
    return [];
  }

  // Valida se usuário tem ao menos uma das roles necessárias (ONEOF)
  async hasOneOf(email: string, permitted: string[]): Promise<boolean> {
    const userRoles = await this.getRoleNames(email);
    return userRoles.some(r => permitted.includes(r));
  }
}