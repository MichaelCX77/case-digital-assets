import { Module } from '@nestjs/common';
import { AccountTypeController } from './account-type.controller';
import { AccountTypeService } from './account-type.service';
import { AccountTypeRepository } from './account-type.repository';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * NestJS module providing account type features,
 * including controller, service, repository, and Prisma integration.
 */
@Module({
  imports: [PrismaModule],
  controllers: [AccountTypeController],
  providers: [AccountTypeService, AccountTypeRepository],
  exports: [AccountTypeService] // Export the service for use in other modules
})
export class AccountTypeModule {}