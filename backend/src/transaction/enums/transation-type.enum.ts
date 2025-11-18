/**
 * Enum representing supported transaction types.
 */
export enum TransactionType {
  /** Funds added to the account */
  DEPOSIT = 'DEPOSIT',

  /** Funds withdrawn from the account */
  WITHDRAW = 'WITHDRAW',

  /** Outgoing transfer from the account */
  TRANSFER_OUT = 'TRANSFER_OUT',

  /** Incoming transfer to the account */
  TRANSFER_IN = 'TRANSFER_IN',
}