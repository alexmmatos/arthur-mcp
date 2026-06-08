import { Injectable } from '@nestjs/common';
import { Resource, ResourceTemplate, Context } from '@rekog/mcp-nest';
import { randomUUID } from 'crypto';
import { ApiAdapterService, ApiAdapterError } from '../api-adapter/api-adapter.service';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class UsersResource {
  constructor(
    private readonly api: ApiAdapterService,
    private readonly logging: LoggingService,
  ) {}

  @Resource({
    uri: 'api://users',
    name: 'users-list',
    description: 'Full list of users as a JSON document. Read this to get all users without calling a tool.',
    mimeType: 'application/json',
  })
  async getUsersResource(_context: Context): Promise<{
    contents: { uri: string; mimeType: string; text: string }[];
  }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({
      toolName: 'resource:users-list',
      requestId,
      inputPayload: {},
    });

    try {
      const users = await this.api.getUsers();

      this.logging.toolCallSuccess({
        toolName: 'resource:users-list',
        requestId,
        durationMs: Date.now() - start,
        outputSize: JSON.stringify(users).length,
      });

      return {
        contents: [
          {
            uri: 'api://users',
            mimeType: 'application/json',
            text: JSON.stringify(users, null, 2),
          },
        ],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'resource:users-list',
        requestId,
        durationMs: Date.now() - start,
        reason: err instanceof ApiAdapterError ? 'upstream_error' : 'internal_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @ResourceTemplate({
    uriTemplate: 'api://users/{userId}',
    name: 'user-by-id',
    description: 'Retrieve a single user document by substituting {userId} with a numeric ID, e.g. api://users/1.',
    mimeType: 'application/json',
  })
  async getUserByIdResource(
    params: { userId: string },
    _context: Context,
  ): Promise<{ contents: { uri: string; mimeType: string; text: string }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({
      toolName: 'resource:user-by-id',
      requestId,
      inputPayload: params,
    });

    try {
      const user = await this.api.getUserById(params.userId);

      this.logging.toolCallSuccess({
        toolName: 'resource:user-by-id',
        requestId,
        durationMs: Date.now() - start,
        outputSize: JSON.stringify(user).length,
      });

      return {
        contents: [
          {
            uri: `api://users/${params.userId}`,
            mimeType: 'application/json',
            text: JSON.stringify(user, null, 2),
          },
        ],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'resource:user-by-id',
        requestId,
        durationMs: Date.now() - start,
        reason:
          err instanceof ApiAdapterError && err.statusCode === 404
            ? 'not_found'
            : 'upstream_error',
        error: (err as Error).message,
        upstreamError: err instanceof ApiAdapterError ? err.upstream : undefined,
      });
      throw err;
    }
  }
}
