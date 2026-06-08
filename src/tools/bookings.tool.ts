import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ApiAdapterService, ApiAdapterError } from '../api-adapter/api-adapter.service';
import { LoggingService } from '../logging/logging.service';

const CreateBookingSchema = z.object({
  userId: z.number().int().positive().describe('ID of the user making the booking'),
  title: z.string().min(3).max(120).describe('Short booking title'),
  body: z.string().min(1).describe('Full booking description or notes'),
});

@Injectable()
export class BookingsTool {
  constructor(
    private readonly api: ApiAdapterService,
    private readonly logging: LoggingService,
  ) {}

  @Tool({
    name: 'getBookings',
    description: 'List all existing bookings (posts) from the API.',
    parameters: z.object({}),
  })
  async getBookings(): Promise<{ content: { type: string; text: string }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({ toolName: 'getBookings', requestId, inputPayload: {} });

    try {
      const posts = await this.api.getPosts();

      this.logging.toolCallSuccess({
        toolName: 'getBookings',
        requestId,
        durationMs: Date.now() - start,
        outputSize: JSON.stringify(posts).length,
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(posts, null, 2) }],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'getBookings',
        requestId,
        durationMs: Date.now() - start,
        reason: err instanceof ApiAdapterError ? 'upstream_error' : 'internal_error',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  @Tool({
    name: 'createBooking',
    description: 'Create a new booking for a given user.',
    parameters: CreateBookingSchema,
  })
  async createBooking(
    params: z.infer<typeof CreateBookingSchema>,
  ): Promise<{ content: { type: string; text: string }[] }> {
    const requestId = randomUUID();
    const start = Date.now();

    this.logging.toolCallStart({
      toolName: 'createBooking',
      requestId,
      inputPayload: params,
    });

    try {
      const booking = await this.api.createPost({
        userId: params.userId,
        title: params.title,
        body: params.body,
      });

      this.logging.toolCallSuccess({
        toolName: 'createBooking',
        requestId,
        durationMs: Date.now() - start,
        outputSize: JSON.stringify(booking).length,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, booking }, null, 2),
          },
        ],
      };
    } catch (err) {
      this.logging.toolCallError({
        toolName: 'createBooking',
        requestId,
        durationMs: Date.now() - start,
        reason: 'upstream_error',
        error: (err as Error).message,
        upstreamError: err instanceof ApiAdapterError ? err.upstream : undefined,
      });
      throw err;
    }
  }
}
