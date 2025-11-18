import { IsString } from 'class-validator';

export class LinkAccountDto {
  @IsString()
  accountId: string;
}