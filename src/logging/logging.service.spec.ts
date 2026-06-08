import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from './logging.service';
import { JsonLogger } from './json-logger';

describe('LoggingService', () => {
  let service: LoggingService;
  let logger: JsonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonLogger, LoggingService],
    }).compile();

    service = module.get(LoggingService);
    logger = module.get(JsonLogger);

    jest.spyOn(logger, 'log').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  describe('toolCallStart', () => {
    it('emits tool_call_start event', () => {
      service.toolCallStart({ toolName: 'getUsers', requestId: 'req-1', clientId: 'client-a' });
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'tool_call_start', toolName: 'getUsers', requestId: 'req-1' }),
      );
    });
  });

  describe('toolCallSuccess', () => {
    it('emits tool_call_success with success=true', () => {
      service.toolCallSuccess({ toolName: 'getUsers', requestId: 'req-1', durationMs: 42 });
      expect(logger.log).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'tool_call_success', success: true, durationMs: 42 }),
      );
    });
  });

  describe('toolCallError', () => {
    it('emits tool_call_error via error channel', () => {
      service.toolCallError({
        toolName: 'getUsers',
        requestId: 'req-1',
        durationMs: 10,
        reason: 'upstream_error',
        error: 'timeout',
      });
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'tool_call_error', success: false, reason: 'upstream_error' }),
      );
    });
  });
});
