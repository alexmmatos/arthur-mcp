import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { DynamicMcpService } from './dynamic-mcp.service';
import { McpApiKeyGuard } from './mcp-api-key.guard';
import { RateLimitGuard } from './rate-limit.guard';
import { ProjectStateGuard } from './project-state.guard';

/**
 * Per-project MCP endpoint — stateless Streamable HTTP.
 * URL: /mcp/server/:serverId
 *
 * Supports MCP clients (Claude Desktop, Cursor, etc.) using:
 *   POST   /mcp/server/:serverId   → ListTools / CallTool
 *   GET    /mcp/server/:serverId   → SSE (connectivity ping)
 *   DELETE /mcp/server/:serverId   → End session (no-op in stateless mode)
 */
@Controller('mcp/server')
export class DynamicMcpController {
  constructor(private readonly dynamicMcpService: DynamicMcpService) {}

  /**
   * Simple REST endpoint for testing a tool directly from the frontend.
   * Calls baseUrl + external endpoint without going through the MCP protocol.
   * POST /mcp/server/:serverId/execute/:toolName
   * Body: { arguments: { param1: value1, ... } }
   */
  @Post(':serverId/execute/:toolName')
  @HttpCode(200)
  async executeToolDirect(
    @Param('serverId') serverId: string,
    @Param('toolName') toolName: string,
    @Body('arguments') args: Record<string, unknown>,
  ) {
    return this.dynamicMcpService.executeTool(serverId, toolName, args ?? {});
  }

  @UseGuards(ProjectStateGuard, McpApiKeyGuard, RateLimitGuard)
  @Post(':serverId')
  @HttpCode(200)
  async handlePost(
    @Param('serverId') serverId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const queryParams = (req as any).query as Record<string, string>;
    const server = await this.dynamicMcpService.createMcpServer(serverId, queryParams);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => server.close().catch(() => undefined));

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }

  @UseGuards(ProjectStateGuard, McpApiKeyGuard, RateLimitGuard)
  @Get(':serverId')
  async handleGet(
    @Param('serverId') serverId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const queryParams = (req as any).query as Record<string, string>;
    const server = await this.dynamicMcpService.createMcpServer(serverId, queryParams);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => server.close().catch(() => undefined));

    await server.connect(transport);
    await transport.handleRequest(req, res);
  }

  @UseGuards(McpApiKeyGuard, RateLimitGuard)
  @Delete(':serverId')
  @HttpCode(200)
  async handleDelete(
    @Param('serverId') serverId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const queryParams = (req as any).query as Record<string, string>;
    const server = await this.dynamicMcpService.createMcpServer(serverId, queryParams);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => server.close().catch(() => undefined));

    await server.connect(transport);
    await transport.handleRequest(req, res);
  }
}
