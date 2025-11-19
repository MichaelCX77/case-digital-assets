/**
 * Example responses for Account endpoints in the banking system.
 * - accountsResponseExample: Array of accounts for GET /accounts
 * - accountByIdResponseExample: Single account for GET /accounts/{id}
 * - accountUsersResponseExample: Array of users for GET /accounts/{id}/users
 */

export const accountsResponseExample = [
  {
    idAccount: "645ee1df-bbd9-4d31-912a-5fae89dcb406",
    balance: 588.22,
    accountType: {
      id: "485a5d57-bbd9-4d41-912a-5fae89dcb777",
      name: "CHECKING",
      description: "Ordinary checking account"
    },
    status: "ACTIVE",
    createdAt: "2025-01-05T16:22:20.121Z",
    updatedAt: "2025-11-19T15:16:46.375Z"
  },
  {
    idAccount: "f1326c77-911c-4c6f-bbfa-650e5e37e3cd",
    balance: 5143.89,
    accountType: {
      id: "ac5a5d11-bbd9-4d41-912a-5fae89dcb888",
      name: "SAVINGS",
      description: "High-yield savings account"
    },
    status: "ACTIVE",
    createdAt: "2025-01-05T16:22:20.121Z",
    updatedAt: "2025-11-19T15:16:46.375Z"
  }
];

export const accountByIdResponseExample = {
  idAccount: "645ee1df-bbd9-4d31-912a-5fae89dcb406",
  balance: 588.22,
  accountType: {
    id: "485a5d57-bbd9-4d41-912a-5fae89dcb777",
    name: "CHECKING",
    description: "Ordinary checking account"
  },
  status: "ACTIVE",
  createdAt: "2025-01-05T16:22:20.121Z",
  updatedAt: "2025-11-19T15:16:46.375Z"
};

/**
 * Example response for GET /accounts/{id}/users
 * Each user follows the User model from Prisma schema:
 * - id: UUID
 * - name: string
 * - email: string
 * - role: { id, name, description }
 * - createdAt: DateTime ISO string
 * - updatedAt: DateTime ISO string
 */
export const accountUsersResponseExample = [
  {
    id: "317c3605-aebd-44d4-98f0-4e5c050c3d70",
    name: "Alice Silva",
    email: "alice.silva@example.com",
    role: {
      id: "1d741800-01b5-4fd1-a170-e9a59b7d5b7a",
      name: "OWNER",
      description: "Full access owner role"
    },
    createdAt: "2025-01-03T12:20:12.495Z",
    updatedAt: "2025-11-18T11:37:05.398Z"
  },
  {
    id: "55ad6a78-0958-4d64-aeec-e1b1ddc9abf3",
    name: "João Pereira",
    email: "joao.pereira@example.com",
    role: {
      id: "22d74181-11b5-4fd1-a170-e1a59b7d5b88",
      name: "ADMIN",
      description: "Administrator role"
    },
    createdAt: "2025-01-04T10:12:10.500Z",
    updatedAt: "2025-10-20T10:17:05.398Z"
  }
];