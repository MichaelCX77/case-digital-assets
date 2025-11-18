export class AccountResponseDto {
  id: string;
  balance: number;
  accountTypeId: string;
  accountTypeName?: string;
  status: string;            // <-- Novo campo incluído!
  createdAt: Date;
  updatedAt: Date;

  constructor(account: any) {
    this.id = account.idAccount;
    this.balance = account.balance;
    this.accountTypeId = account.accountTypeId;
    this.accountTypeName = account.accountType?.name;
    this.status = account.status;      // <-- Novo campo preenchido!
    this.createdAt = account.createdAt;
    this.updatedAt = account.updatedAt;
  }
}