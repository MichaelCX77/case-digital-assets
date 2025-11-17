import { IsString } from 'class-validator';

export class VincularContaDto {
  @IsString()
  accountId: string;
}