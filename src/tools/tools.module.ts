import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { ApiAdapterModule } from '../api-adapter/api-adapter.module';
import { LoggingModule } from '../logging/logging.module';
import { ResourcesModule } from '../resources/resources.module';
import { UsersTool } from './users.tool';
import { BookingsTool } from './bookings.tool';
import { HtmlTool } from './html.tool';

@Module({
  imports: [
    ApiAdapterModule,
    LoggingModule,
    ResourcesModule,
    McpModule.forFeature([UsersTool, BookingsTool, HtmlTool], 'rest-api-mcp-wrapper'),
  ],
  providers: [UsersTool, BookingsTool, HtmlTool],
  // HtmlTool registrado em forFeature acima — getUsersCardList incluído automaticamente
})
export class ToolsModule {}
