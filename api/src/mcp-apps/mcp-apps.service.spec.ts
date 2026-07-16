import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { McpAppsService } from './mcp-apps.service';
import type { McpAppRecord } from './mcp-app.repository';
import type { SwaggerProjectRecord } from '../swagger/swagger-project.repository';

const app = (overrides: Partial<McpAppRecord> = {}): McpAppRecord => ({
  id: 'app-1',
  name: 'Orders table',
  serverId: 'server-1',
  toolName: 'list_orders',
  viewType: 'table',
  viewConfig: { columns: ['id', 'status'] },
  isActive: true,
  createdAt: new Date('2026-07-16T10:00:00Z'),
  updatedAt: new Date('2026-07-16T10:00:00Z'),
  ...overrides,
});

const source = (overrides: Partial<SwaggerProjectRecord> = {}): SwaggerProjectRecord => ({
  _id: 'server-1',
  name: 'Commerce API',
  baseUrl: 'https://commerce.example.com',
  description: 'Commerce data source',
  tools: [{ name: 'list_orders', description: 'Lists orders', enabled: true, inputSchema: { type: 'object' } } as any],
  auth: { type: 'apiKey', apiKey: 'must-not-leak' } as any,
  status: 'ready',
  mcpApiKeys: [],
  resources: [],
  prompts: [],
  chains: [],
  tags: ['commerce'],
  rateLimit: { enabled: false, requestsPerMinute: 60 },
  isPaused: false,
  maintenanceMode: { enabled: false, message: '' },
  availabilityWindow: { enabled: false, timezone: 'UTC', schedule: [] },
  alertConfig: { enabled: false, errorThresholdPct: 10, notifyEmail: '' },
  ...overrides,
});

describe('McpAppsService', () => {
  const appRepo = {
    findAll: jest.fn(), findById: jest.fn(), findByServerId: jest.fn(),
    findByServerAndTool: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(),
  };
  const projectRepo = { findById: jest.fn(), findAll: jest.fn() };
  const dynamicMcp = { invalidate: jest.fn() };
  let service: McpAppsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new McpAppsService(appRepo as any, projectRepo as any, dynamicMcp as any);
  });

  it('creates an App for an enabled source tool and invalidates the source cache', async () => {
    projectRepo.findById.mockResolvedValue(source());
    appRepo.findByServerAndTool.mockResolvedValue(null);
    appRepo.create.mockResolvedValue(app());

    const result = await service.create({
      name: '  Orders table  ', serverId: 'server-1', toolName: 'list_orders',
      viewType: 'table', viewConfig: { columns: [' id ', '', 'status'] },
    });

    expect(appRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Orders table', viewConfig: { columns: ['id', 'status'] }, isActive: true,
    }));
    expect(dynamicMcp.invalidate).toHaveBeenCalledWith('server-1');
    expect(result.resourceUri).toBe('ui://arthur/apps/app-1/view.html');
  });

  it('rejects a missing source tool and an App already bound to the tool', async () => {
    projectRepo.findById.mockResolvedValue(source({ tools: [] }));
    await expect(service.create({ name: 'App', serverId: 'server-1', toolName: 'missing', viewType: 'json' }))
      .rejects.toThrow(BadRequestException);

    projectRepo.findById.mockResolvedValue(source());
    appRepo.findByServerAndTool.mockResolvedValue(app());
    await expect(service.create({ name: 'App', serverId: 'server-1', toolName: 'list_orders', viewType: 'json' }))
      .rejects.toThrow(ConflictException);
  });

  it('returns source metadata without credentials', async () => {
    projectRepo.findAll.mockResolvedValue([source()]);

    const result = await service.listSources();

    expect(result[0]).toEqual(expect.objectContaining({ id: 'server-1', name: 'Commerce API' }));
    expect(result[0].tools[0].name).toBe('list_orders');
    expect(result[0]).not.toHaveProperty('auth');
    expect(JSON.stringify(result)).not.toContain('must-not-leak');
  });

  it('invalidates both source caches when an App moves to another source', async () => {
    const current = app();
    const moved = app({ serverId: 'server-2' });
    appRepo.findById.mockResolvedValue(current);
    projectRepo.findById.mockImplementation(async (id: string) => source({ _id: id }));
    appRepo.findByServerAndTool.mockResolvedValue(null);
    appRepo.update.mockResolvedValue(moved);

    await service.update('app-1', { serverId: 'server-2' });

    expect(dynamicMcp.invalidate).toHaveBeenCalledWith('server-1');
    expect(dynamicMcp.invalidate).toHaveBeenCalledWith('server-2');
  });

  it('rejects delete for an unknown App', async () => {
    appRepo.findById.mockResolvedValue(null);
    await expect(service.delete('missing')).rejects.toThrow(NotFoundException);
  });
});
