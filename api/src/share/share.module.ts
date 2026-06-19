import { Module } from '@nestjs/common';
import { ShareController } from './share.controller';
import { SwaggerModule } from '../swagger/swagger.module';

@Module({
  imports: [SwaggerModule],
  controllers: [ShareController],
})
export class ShareModule {}
