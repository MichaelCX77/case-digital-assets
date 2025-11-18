import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

/**
 * Factory function to create and configure the global Winston logger for the project.
 * - Logs are formatted as JSON and include timestamps.
 * - Additional transports (e.g., file logging) can be added as needed.
 * - This configuration is imported and used in main.ts (and wherever you need logging).
 */

export function createWinstonLogger(): WinstonModuleOptions {
  return {
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  };
}