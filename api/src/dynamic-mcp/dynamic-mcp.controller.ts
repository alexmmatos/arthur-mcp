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
 * URL: /mcp/project/:projectId
 *
 * Supports MCP clients (Claude Desktop, Cursor, etc.) using:
 *   POST   /mcp/project/:projectId   → ListTools / CallTool
 *   GET    /mcp/project/:projectId   → SSE (connectivity ping)
 *   DELETE /mcp/project/:projectId   → End session (no-op in stateless mode)
 */
@Controller('mcp/project')
export class DynamicMcpController {
  constructor(private readonly dynamicMcpService: DynamicMcpService) {}

  /**
   * Simple REST endpoint for testing a tool directly from the frontend.
   * Calls baseUrl + external endpoint without going through the MCP protocol.
   * POST /mcp/project/:projectId/execute/:toolName
   * Body: { arguments: { param1: value1, ... } }
   */
  @Post(':projectId/execute/:toolName')
  @HttpCode(200)
  async executeToolDirect(
    @Param('projectId') projectId: string,
    @Param('toolName') toolName: string,
    @Body('arguments') args: Record<string, unknown>,
  ) {
    return this.dynamicMcpService.executeTool(projectId, toolName, args ?? {});
  }

  @UseGuards(ProjectStateGuard, McpApiKeyGuard, RateLimitGuard)
  @Post(':projectId')
  @HttpCode(200)
  async handlePost(
    @Param('projectId') projectId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const server = await this.dynamicMcpService.createMcpServer(projectId);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true, // returns plain JSON instead of SSE for clients that accept JSON
    });

    res.on('close', () => server.close().catch(() => undefined));

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }

  @UseGuards(ProjectStateGuard, McpApiKeyGuard, RateLimitGuard)
  @Get(':projectId')
  async handleGet(
    @Param('projectId') projectId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const server = await this.dynamicMcpService.createMcpServer(projectId);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => server.close().catch(() => undefined));

    await server.connect(transport);
    await transport.handleRequest(req, res);
  }

  @UseGuards(McpApiKeyGuard, RateLimitGuard)
  @Delete(':projectId')
  @HttpCode(200)
  async handleDelete(
    @Param('projectId') projectId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const server = await this.dynamicMcpService.createMcpServer(projectId);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => server.close().catch(() => undefined));

    await server.connect(transport);
    await transport.handleRequest(req, res);
  }
}
