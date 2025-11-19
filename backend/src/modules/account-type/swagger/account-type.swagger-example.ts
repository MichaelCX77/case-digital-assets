/**
 * Example responses for AccountType endpoints in the banking system.
 * - accountTypeListResponseExample: Array of account types for GET /account-types
 * - accountTypeByIdResponseExample: Single account type for GET /account-types/{id}
 */

export const accountTypeListResponseExample = [
  {
    id: "485a5d57-bbd9-4d41-912a-5fae89dcb777",
    name: "CHECKING",
    description: "Ordinary checking account",
    createdAt: "2025-01-05T16:22:20.121Z",
    updatedAt: "2025-11-19T15:16:46.375Z"
  },
  {
    id: "ac5a5d11-bbd9-4d41-912a-5fae89dcb888",
    name: "SAVINGS",
    description: "High-yield savings account",
    createdAt: "2025-01-05T16:22:20.121Z",
    updatedAt: "2025-11-19T15:16:46.375Z"
  }
];

export const accountTypeByIdResponseExample = {
  id: "485a5d57-bbd9-4d41-912a-5fae89dcb777",
  name: "CHECKING",
  description: "Ordinary checking account",
  createdAt: "2025-01-05T16:22:20.121Z",
  updatedAt: "2025-11-19T15:16:46.375Z"
};