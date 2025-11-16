import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // módulo global, não precisa importar manualmente em outros módulos
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
