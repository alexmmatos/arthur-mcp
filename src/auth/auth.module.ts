import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { config } from '../config/configuration';
import { UsersModule } from '../users/users.module';
import { ApiKeyMiddleware } from './api-key.middleware';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalAuthGuard } from './local.guard';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    ApiKeyMiddleware,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    LocalStrategy,
    LocalAuthGuard,
  ],
  exports: [ApiKeyMiddleware, JwtAuthGuard],
})
export class AuthModule {}
