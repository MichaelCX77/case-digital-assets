import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { ApiOkResponse } from '@nestjs/swagger';

/**
 * Controller for handling base application endpoint.
 */
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly health: HealthCheckService
  ) {}

  /**
   * Returns a hello message for base endpoint as a JSON object.
   * @returns Object with hello message.
   */
  @Get()
  @ApiOkResponse({
    description: 'Base hello response',
    schema: {
      example: { message: 'Hello Case Digital Assets!' },
      properties: {
        message: { type: 'string', example: 'Hello Case Digital Assets!' }
      }
    }
  })
  getHello(): { message: string } {
    return this.appService.getHello();
  }

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}