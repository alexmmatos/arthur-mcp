import { Module } from '@nestjs/common';
import { DynamicMcpModule } from '../dynamic-mcp/dynamic-mcp.module';
import { McpAppsController } from './mcp-apps.controller';
import { McpAppsService } from './mcp-apps.service';

@Module({
  imports: [DynamicMcpModule],
  controllers: [McpAppsController],
  providers: [McpAppsService],
  exports: [McpAppsService],
})
export class McpAppsModule {}
