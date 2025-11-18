import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service that provides a singleton Prisma Client for the application.
 * Manages database connection lifecycle on module init and destroy.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Initializes the Prisma Client connection when the module is loaded.
   */
  async onModuleInit() {
    await this.$connect();
  }

  
  /**
   * Closes the Prisma Client connection when the module is destroyed.
   * Logs a message to indicate successful disconnection.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected!');
  }
}