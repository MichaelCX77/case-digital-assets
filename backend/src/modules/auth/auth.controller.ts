/**
 * Controller for authentication endpoints.
 * Exposes route for generating JWT tokens using email and password.
 * Includes OpenAPI/Swagger docs for input and output models.
 * OBS: Esta controller é responsável por montar o DTO de saída do token.
 */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Generates a JWT authentication token based on user credentials.
   * Monta o DTO de saída { access_token }.
   * @param body Object containing user's email and password.
   * @returns Object containing JWT token.
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
    const token = await this.authService.issueTokenByEmail(body.email, body.password);
    return { access_token: token };
  }
}