import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Busca o usuário pelo email e inclui a role associada
  async findByEmail(email: string): Promise<(User & { role: Role | null }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }

  // Consulta apenas o nome da role do usuário pelo email
  async findRoleNameByEmail(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    return user && user.role ? user.role.name : null;
  }
}