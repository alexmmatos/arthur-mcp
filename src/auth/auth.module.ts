import { Module } from '@nestjs/common';
import { ApiKeyMiddleware } from './api-key.middleware';

@Module({
  providers: [ApiKeyMiddleware],
  exports: [ApiKeyMiddleware],
})
export class AuthModule {}
