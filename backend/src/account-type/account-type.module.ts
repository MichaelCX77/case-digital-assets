import { Module } from '@nestjs/common';
import { AccountTypeController } from './account-type.controller';
import { AccountTypeService } from './account-type.service';
import { AccountTypeRepository } from './account-type.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountTypeController],
  providers: [AccountTypeService, AccountTypeRepository],
  exports: [AccountTypeService]
})
export class AccountTypeModule {}