export class CreateTransactionDto {
  type: string;
  amount: number;
  destinationAccountId: string;
  operatorUserId: string;
}