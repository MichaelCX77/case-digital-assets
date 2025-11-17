import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async getToken(@Body() body: { email: string; password: string }) {
    return this.authService.issueTokenByEmail(body.email, body.password);
  }
}
