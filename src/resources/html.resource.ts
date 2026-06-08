import { Injectable } from '@nestjs/common';
import { Resource, ResourceTemplate, Context } from '@rekog/mcp-nest';
import { randomUUID } from 'crypto';
import { ApiAdapterService, ApiAdapterError } from '../api-adapter/api-adapter.service';
import { HtmlTemplateService } from './html-template.service';
import { McpDocsService } from './mcp-docs.service';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class HtmlResource {
  constructor(
    private readonly api: ApiAdapterService,
    private readonly templates: HtmlTemplateService,
    private readonly mcpDocs: McpDocsService,
    private readonly logging: LoggingService,
  ) {}

  @Resource({
    uri: 'ui://dashboard',
    name: 'server-dashboard',
    description: 'HTML dashboard showing server status, registered tools and available resources.',
    mimeType: 'text/html',
  })
  async getDashboard(_context: Context): Promise<{
    contents: { uri: string; mimeType: string; text: string }[];
  }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'resource:server-dashboard', requestId, inputPayload: {} });

    try {
      const users = await this.api.getUsers();
      const html = this.templates.dashboard(users.length);

      this.logging.toolCallSuccess({
        toolName: 'resource:server-dashboard',
        requestId,
        durationMs: Date.now() - start,
      });

      return { contents: [{ uri: 'ui://dashboard', mimeType: 'text/html', text: html }] };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'resource:server-dashboard',
        requestId,
        durationMs: Date.now() - start,
        reason: 'upstream_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @Resource({
    uri: 'ui://users/cards',
    name: 'users-card-list',
    description: 'All users rendered as a responsive HTML grid of cards with avatar, contact info and company.',
    mimeType: 'text/html',
  })
  async getUserCardList(_context: Context): Promise<{
    contents: { uri: string; mimeType: string; text: string }[];
  }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'resource:users-card-list', requestId, inputPayload: {} });

    try {
      const users = await this.api.getUsers();
      const html = this.templates.userCardList(users);

      this.logging.toolCallSuccess({
        toolName: 'resource:users-card-list',
        requestId,
        durationMs: Date.now() - start,
        outputSize: html.length,
      });

      return { contents: [{ uri: 'ui://users/cards', mimeType: 'text/html', text: html }] };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'resource:users-card-list',
        requestId,
        durationMs: Date.now() - start,
        reason: 'upstream_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @Resource({
    uri: 'ui://docs',
    name: 'mcp-api-docs',
    description: 'Swagger-like HTML documentation listing all tools, resources and resource templates with parameter tables and curl examples.',
    mimeType: 'text/html',
  })
  async getDocs(_context: Context): Promise<{
    contents: { uri: string; mimeType: string; text: string }[];
  }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'resource:mcp-api-docs', requestId, inputPayload: {} });

    try {
      const data = this.mcpDocs.build();
      const html = this.templates.docs(data);

      this.logging.toolCallSuccess({
        toolName: 'resource:mcp-api-docs',
        requestId,
        durationMs: Date.now() - start,
        outputSize: html.length,
      });

      return { contents: [{ uri: 'ui://docs', mimeType: 'text/html', text: html }] };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'resource:mcp-api-docs',
        requestId,
        durationMs: Date.now() - start,
        reason: 'internal_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @ResourceTemplate({
    uriTemplate: 'ui://users/{userId}/profile',
    name: 'user-profile-html',
    description: 'HTML profile card for a user. Substitute {userId} with a numeric ID, e.g. ui://users/3/profile.',
    mimeType: 'text/html',
  })
  async getUserProfile(
    params: { userId: string },
    _context: Context,
  ): Promise<{ contents: { uri: string; mimeType: string; text: string }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'resource:user-profile-html', requestId, inputPayload: params });

    try {
      const user = await this.api.getUserById(params.userId);
      const html = this.templates.userProfile(user);

      this.logging.toolCallSuccess({
        toolName: 'resource:user-profile-html',
        requestId,
        durationMs: Date.now() - start,
      });

      return {
        contents: [{ uri: `ui://users/${params.userId}/profile`, mimeType: 'text/html', text: html }],
      };
    } catch (err) {
      const reason =
        err instanceof ApiAdapterError && err.statusCode === 404 ? 'not_found' : 'upstream_error';

      this.logging.toolCallError({
        toolName: 'resource:user-profile-html',
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
