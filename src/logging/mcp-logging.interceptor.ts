import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { LoggingService } from './logging.service';

@Injectable()
export class McpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logging: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const body = req.body as Record<string, any>;

    const isToolCall = body?.method === 'tools/call';
    const toolName: string = body?.params?.name ?? 'unknown';
    const requestId = randomUUID();
    const clientId = req.headers['x-api-key'] ? 'authenticated-client' : 'anonymous';
    const startTime = Date.now();

    if (isToolCall) {
      this.logging.toolCallStart({
        toolName,
        requestId,
        clientId,
        inputPayload: body?.params?.arguments,
      });
    }

    return next.handle().pipe(
      tap((data) => {
        if (!isToolCall) return;
        this.logging.toolCallSuccess({
          toolName,
          requestId,
          durationMs: Date.now() - startTime,
          outputSize: data != null ? JSON.stringify(data).length : 0,
        });
      }),
      catchError((err: Error) => {
        if (isToolCall) {
          this.logging.toolCallError({
            toolName,
            requestId,
            durationMs: Date.now() - startTime,
            reason: 'interceptor_error',
            error: err.message,
          });
        }
        throw err;
      }),
    );
  }
}
