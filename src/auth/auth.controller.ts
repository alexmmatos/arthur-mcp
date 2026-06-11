import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.guard';

const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  login(@Request() req: any): { access_token: string } {
    return this.authService.login(req.user);
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: unknown): Promise<{ access_token: string }> {
    const { username, email, password } = RegisterSchema.parse(body);
    return this.authService.register(username, password, email);
  }
}
