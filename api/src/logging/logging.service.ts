import { Injectable } from '@nestjs/common';
import { JsonLogger } from './json-logger';

@Injectable()
export class LoggingService {
  constructor(private readonly logger: JsonLogger) {}

  toolCallStart(params: {
    toolName: string;
    requestId: string;
    clientId?: string;
    inputPayload?: unknown;
  }): void {
    this.logger.log({ event: 'tool_call_start', ...params });
  }

  toolCallSuccess(params: {
    toolName: string;
    requestId: string;
    durationMs: number;
    outputSize?: number;
  }): void {
    this.logger.log({ event: 'tool_call_success', success: true, ...params });
  }

  toolCallError(params: {
    toolName: string;
    requestId: string;
    durationMs: number;
    reason: string;
    error?: string;
    upstreamError?: string;
  }): void {
    this.logger.error({ event: 'tool_call_error', success: false, ...params });
  }
}
