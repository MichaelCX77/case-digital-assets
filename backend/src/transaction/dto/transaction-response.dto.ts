export class TransactionResponseDto {
  idTransaction: string;
  accountId: string;
  type: string;
  amount: number;
  timestamp: Date;
  balanceBefore: number;
  balanceAfter: number;
  operatorUserId?: string;
  createdAt: Date;
  updatedAt: Date;
  destinationAccountId?: string; // novo campo!
  sourceAccountId?: string;      // novo campo!

  constructor(data: any) {
    this.idTransaction = data.idTransaction;
    this.accountId = data.accountId;
    this.type = data.type;
    this.amount = data.amount;
    this.timestamp = data.timestamp;
    this.balanceBefore = data.balanceBefore;
    this.balanceAfter = data.balanceAfter;
    this.operatorUserId = data.operatorUserId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.destinationAccountId = data.destinationAccountId; // novo campo
    this.sourceAccountId = data.sourceAccountId;           // novo campo
  }
}