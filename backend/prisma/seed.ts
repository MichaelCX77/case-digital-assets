import { SeederRunner } from './seeds/core/SeederRunner';

import { RoleSeeder } from './seeds/RoleSeeder';
import { UserSeeder } from './seeds/UserSeeder';
import { AccountSeeder } from './seeds/AccountSeeder';
import { TransactionSeeder } from './seeds/TransactionSeeder';

new SeederRunner()
  .add(new RoleSeeder())
  .add(new UserSeeder())
  .add(new AccountSeeder())
  .add(new TransactionSeeder())
  .run();
