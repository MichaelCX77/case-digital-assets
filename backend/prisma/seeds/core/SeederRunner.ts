import { PrismaClient } from '@prisma/client';
import { ISeeder } from './ISeeder';

export class SeederRunner {
  private prisma: PrismaClient;
  private seeders: ISeeder[] = [];
  private context: Record<string, any> = {};

  constructor() {
    this.prisma = new PrismaClient();
  }

  add(seeder: ISeeder): SeederRunner {
    this.seeders.push(seeder);
    return this;
  }

  async run() {
    console.log('🌱 Executando seeds...');

    for (const seeder of this.seeders) {
      const name = seeder.constructor.name;
      console.log(`➡ ${name}...`);

      await seeder.run(this.prisma, this.context);

      console.log(`✔ ${name} concluído`);
    }

    await this.prisma.$disconnect();

    console.log('🌱 Seed finalizado!');
  }
}
