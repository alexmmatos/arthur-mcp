import { ApiKeyMiddleware } from './api-key.middleware';

describe('ApiKeyMiddleware', () => {
  let middleware: ApiKeyMiddleware;
  let mockRes: { status: jest.Mock; json: jest.Mock };
  let mockNext: jest.Mock;

  beforeEach(() => {
    process.env.MCP_API_KEY = 'test-key';
    middleware = new ApiKeyMiddleware();
    mockNext = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('calls next() when x-api-key is valid', () => {
    const req = { headers: { 'x-api-key': 'test-key' } } as any;
    middleware.use(req, mockRes as any, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('returns 401 when x-api-key header is missing', () => {
    const req = { headers: {} } as any;
    middleware.use(req, mockRes as any, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: -32000 }) }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when x-api-key is incorrect', () => {
    const req = { headers: { 'x-api-key': 'wrong-key' } } as any;
    middleware.use(req, mockRes as any, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns JSON-RPC formatted error body', () => {
    const req = { headers: {} } as any;
    middleware.use(req, mockRes as any, mockNext);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.jsonrpc).toBe('2.0');
    expect(body.error.data.reason).toBe('authentication_failed');
  });
});
