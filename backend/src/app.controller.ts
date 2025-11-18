import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller for handling base application endpoint.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a hello message for base endpoint as a JSON object.
   * @returns Object with hello message.
   */
  @Get()
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}