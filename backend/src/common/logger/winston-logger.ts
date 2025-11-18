/**
 * Provides a Winston logger configuration for NestJS.
 * Produces logs in JSON format with timestamps. 
 * Extend transports (e.g. file logging) as needed.
 * Import into modules or main.ts to enable structured logging.
 */
import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

/**
 * Returns structured Winston module options for global logging.
 * @returns WinstonModuleOptions for console logging (JSON/timestamp)
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