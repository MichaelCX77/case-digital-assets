import { SeederRunner } from './seeds/core/SeederRunner';

import { RoleSeeder } from './seeds/RoleSeeder';
import { UserSeeder } from './seeds/UserSeeder';
import { AccountSeeder } from './seeds/AccountSeeder';
import { AccountTypeSeeder } from './seeds/AccountTypeSeeder';
import { TransactionSeeder } from './seeds/TransactionSeeder';

/**
 * Entrypoint for running all database seeders in sequence.
 * 
 * The SeederRunner orchestrates the execution of all seeders:
 * - RoleSeeder: populates roles (OWNER, OPERATOR, ADMIN).
 * - UserSeeder: creates demo users with hashed passwords and assigns roles.
 * - AccountTypeSeeder: seeds account type definitions.
 * - AccountSeeder: creates demo accounts for seeded users and types.
 * - TransactionSeeder: adds initial transactions for demonstration/testing.
 * 
 * Each seeder receives the shared context and can add new entities for downstream usage.
 */
new SeederRunner()
  .add(new RoleSeeder())
  .add(new UserSeeder())
  .add(new AccountTypeSeeder())
  .add(new AccountSeeder())
  .add(new TransactionSeeder())
  .run();