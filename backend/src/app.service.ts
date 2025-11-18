import { Injectable } from '@nestjs/common';

/**
 * Service for handling basic application logic.
 */
@Injectable()
export class AppService {
  /**
   * Returns a hello message for the base endpoint as a JSON object.
   * @returns Object with hello message.
   */
  getHello(): { message: string } {
    return { message: 'Hello Case Digital Assets!' };
  }
}