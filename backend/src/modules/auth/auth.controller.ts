import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for authentication endpoints.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Generates an authentication token using email and password.
   * @param body Object containing the user's email and password.
   * @returns JWT token for authenticated access.
   */
  @Post('token')
  @ApiOperation({ summary: 'Generate authentication token using email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@email.com' },
        password: { type: 'string', example: 'SuperSecretPassword123' }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Token generated successfully',
    schema: {
      example: { access_token: 'your.jwt.token.here' }
    }
  })
  async getToken(@Body() body: { email: string; password: string }) {
    return this.authService.issueTokenByEmail(body.email, body.password);
  }
}