import { Module } from '@nestjs/common';
import { UserAccountService } from './user-account.service';
import { UserRepository } from '../user/user.repository';
import { AccountRepository } from '../account/account.repository';
import { UserLinkAccountDto } from './dto/user-link-account.dto';
import { AccountLinkUserDto } from './dto/account-link-user.dto';

/**
 * NestJS module providing user-account linking features,
 * including service, shared repositories, and DTOs for linking users and accounts.
 * Can be imported by user and account modules to enable N:N relationship management.
 */
@Module({
  providers: [UserAccountService, UserRepository, AccountRepository],
  exports: [UserAccountService, UserLinkAccountDto, AccountLinkUserDto], // Export service and DTOs for use in other modules
})
export class UserAccountModule {}