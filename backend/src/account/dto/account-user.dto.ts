import { IsUUID } from 'class-validator';

export class AccountUserDto {
  @IsUUID()
  userId: string;
}