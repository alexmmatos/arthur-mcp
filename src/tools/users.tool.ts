import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ApiAdapterService, ApiAdapterError } from '../api-adapter/api-adapter.service';
import { LoggingService } from '../logging/logging.service';

const GetUserByIdSchema = z.object({
  userId: z.string().describe('Numeric user ID (e.g. "1")'),
});

@Injectable()
export class UsersTool {
  constructor(
    private readonly api: ApiAdapterService,
    private readonly logging: LoggingService,
  ) {}

  @Tool({
    name: 'getUsers',
    description: 'Retrieve the full list of users from the API.',
    parameters: z.object({}),
  })
  async getUsers(): Promise<{ content: { type: string; text: string }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'getUsers', requestId, inputPayload: {} });

    try {
      const users = await this.api.getUsers();

      this.logging.toolCallSuccess({
        toolName: 'getUsers',
        requestId,
        durationMs: Date.now() - start,
        outputSize: JSON.stringify(users).length,
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(users, null, 2) }],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'getUsers',
        requestId,
        durationMs: Date.now() - start,
        reason: err instanceof ApiAdapterError ? 'upstream_error' : 'internal_error',
        error: (err as Error).message,
        upstreamError: err instanceof ApiAdapterError ? err.upstream : undefined,
      });
      throw err;
    }
  }

  @Tool({
    name: 'getUserById',
    description: 'Retrieve a single user by their numeric ID.',
    parameters: GetUserByIdSchema,
  })
  async getUserById(
    params: z.infer<typeof GetUserByIdSchema>,
  ): Promise<{ content: { type: string; text: string }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({
      toolName: 'getUserById',
      requestId,
      inputPayload: params,
    });

    try {
      const user = await this.api.getUserById(params.userId);

      this.logging.toolCallSuccess({
        toolName: 'getUserById',
        requestId,
        durationMs: Date.now() - start,
        outputSize: JSON.stringify(user).length,
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
      };
    } catch (err) {
      const reason =
        err instanceof ApiAdapterError && err.statusCode === 404
          ? 'not_found'
          : 'upstream_error';

      this.logging.toolCallError({
        toolName: 'getUserById',
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
