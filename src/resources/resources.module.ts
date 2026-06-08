import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { ApiAdapterModule } from '../api-adapter/api-adapter.module';
import { LoggingModule } from '../logging/logging.module';
import { UsersResource } from './users.resource';
import { HtmlResource } from './html.resource';
import { HtmlTemplateService } from './html-template.service';
import { McpDocsService } from './mcp-docs.service';
import { DocsController } from './docs.controller';

@Module({
  imports: [
    ApiAdapterModule,
    LoggingModule,
    McpModule.forFeature([UsersResource, HtmlResource], 'rest-api-mcp-wrapper'),
  ],
  controllers: [DocsController],
  providers: [UsersResource, HtmlResource, HtmlTemplateService, McpDocsService],
  exports: [HtmlTemplateService, McpDocsService],
})
export class ResourcesModule {}
