export interface DepositFlow {
  execute(dto: any, transactionId: string): Promise<any>;
}
export interface WithdrawFlow {
  execute(dto: any, transactionId: string): Promise<any>;
}
export interface TransferFlow {
  execute(dto: any, transactionId: string): Promise<any>;
}