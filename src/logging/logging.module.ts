import { Module } from '@nestjs/common';
import { JsonLogger } from './json-logger';
import { LoggingService } from './logging.service';
import { McpLoggingInterceptor } from './mcp-logging.interceptor';

@Module({
  providers: [JsonLogger, LoggingService, McpLoggingInterceptor],
  exports: [JsonLogger, LoggingService, McpLoggingInterceptor],
})
export class LoggingModule {}
