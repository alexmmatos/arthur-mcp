import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { McpDocsService } from './mcp-docs.service';
import { HtmlTemplateService } from './html-template.service';

@Controller('mcp-docs')
export class DocsController {
  constructor(
    private readonly mcpDocs: McpDocsService,
    private readonly templates: HtmlTemplateService,
  ) {}

  @Get()
  render(@Res() res: Response): void {
    const html = this.templates.docs(this.mcpDocs.build());
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
