import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { McpDocsService, DocsData } from './mcp-docs.service';
import { HtmlTemplateService } from './html-template.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

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

  @Get('json')
  @UseGuards(JwtAuthGuard)
  getJson(): DocsData {
    return this.mcpDocs.build();
  }
}
