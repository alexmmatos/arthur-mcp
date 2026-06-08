import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ApiAdapterService, ApiAdapterError } from '../api-adapter/api-adapter.service';
import { HtmlTemplateService } from '../resources/html-template.service';
import { McpDocsService } from '../resources/mcp-docs.service';
import { LoggingService } from '../logging/logging.service';

const GetUserProfileCardSchema = z.object({
  userId: z.string().describe('Numeric user ID (e.g. "1")'),
});

@Injectable()
export class HtmlTool {
  constructor(
    private readonly api: ApiAdapterService,
    private readonly templates: HtmlTemplateService,
    private readonly mcpDocs: McpDocsService,
    private readonly logging: LoggingService,
  ) {}

  @Tool({
    name: 'getDocsCard',
    description:
      'Returns a Swagger-like HTML documentation page listing all MCP tools (with parameters and curl examples), resources and resource templates. Use this when the user asks to see the API docs, documentation or available tools.',
    parameters: z.object({}),
  })
  async getDocsCard(): Promise<{ content: { type: string; resource: any }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'getDocsCard', requestId, inputPayload: {} });

    try {
      const data = this.mcpDocs.build();
      const html = this.templates.docs(data);

      this.logging.toolCallSuccess({
        toolName: 'getDocsCard',
        requestId,
        durationMs: Date.now() - start,
        outputSize: html.length,
      });

      return {
        content: [
          {
            type: 'resource',
            resource: { uri: 'ui://docs', mimeType: 'text/html', text: html },
          },
        ],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'getDocsCard',
        requestId,
        durationMs: Date.now() - start,
        reason: 'internal_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @Tool({
    name: 'getDashboardCard',
    description:
      'Returns the MCP server dashboard as a rendered HTML card showing tools, resources and live stats. Use this when the user asks to see the dashboard or server status.',
    parameters: z.object({}),
  })
  async getDashboardCard(): Promise<{ content: { type: string; resource: any }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'getDashboardCard', requestId, inputPayload: {} });

    try {
      const users = await this.api.getUsers();
      const html = this.templates.dashboard(users.length);

      this.logging.toolCallSuccess({
        toolName: 'getDashboardCard',
        requestId,
        durationMs: Date.now() - start,
        outputSize: html.length,
      });

      return {
        content: [
          {
            type: 'resource',
            resource: {
              uri: 'ui://dashboard',
              mimeType: 'text/html',
              text: html,
            },
          },
        ],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'getDashboardCard',
        requestId,
        durationMs: Date.now() - start,
        reason: 'upstream_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @Tool({
    name: 'getUsersCardList',
    description:
      'Returns all users as a rendered HTML grid of cards. Each card shows avatar, name, email, phone, website and company. Use this when the user asks to see all users as cards or a visual list.',
    parameters: z.object({}),
  })
  async getUsersCardList(): Promise<{ content: { type: string; resource: any }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'getUsersCardList', requestId, inputPayload: {} });

    try {
      const users = await this.api.getUsers();
      const html = this.templates.userCardList(users);

      this.logging.toolCallSuccess({
        toolName: 'getUsersCardList',
        requestId,
        durationMs: Date.now() - start,
        outputSize: html.length,
      });

      return {
        content: [
          {
            type: 'resource',
            resource: {
              uri: 'ui://users/cards',
              mimeType: 'text/html',
              text: html,
            },
          },
        ],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'getUsersCardList',
        requestId,
        durationMs: Date.now() - start,
        reason: 'upstream_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @Tool({
    name: 'getUserProfileCard',
    description:
      'Returns a user profile as a rendered HTML card with name, avatar, contact info and company. Use this when the user asks to see a profile card or visual summary of a user.',
    parameters: GetUserProfileCardSchema,
  })
  async getUserProfileCard(
    params: z.infer<typeof GetUserProfileCardSchema>,
  ): Promise<{ content: { type: string; resource: any }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({
      toolName: 'getUserProfileCard',
      requestId,
      inputPayload: params,
    });

    try {
      const user = await this.api.getUserById(params.userId);
      const html = this.templates.userProfile(user);

      this.logging.toolCallSuccess({
        toolName: 'getUserProfileCard',
        requestId,
        durationMs: Date.now() - start,
        outputSize: html.length,
      });

      return {
        content: [
          {
            type: 'resource',
            resource: {
              uri: `ui://users/${params.userId}/profile`,
              mimeType: 'text/html',
              text: html,
            },
          },
        ],
      };
    } catch (err) {
      const reason =
        err instanceof ApiAdapterError && err.statusCode === 404 ? 'not_found' : 'upstream_error';

      this.logging.toolCallError({
        toolName: 'getUserProfileCard',
        requestId,
        durationMs: Date.now() - start,
        reason,
        error: (err as Error).message,
        upstreamError: err instanceof ApiAdapterError ? err.upstream : undefined,
      });
      throw err;
    }
  }
}
