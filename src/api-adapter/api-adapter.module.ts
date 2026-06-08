import { Module } from '@nestjs/common';
import { ApiAdapterService } from './api-adapter.service';

@Module({
  providers: [ApiAdapterService],
  exports: [ApiAdapterService],
})
export class ApiAdapterModule {}
