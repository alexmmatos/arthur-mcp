import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MCP_APP_REPO, PROJECT_REPO } from '../database/database.tokens';
import type { ISwaggerProjectRepository, SwaggerProjectRecord } from '../swagger/swagger-project.repository';
import { DynamicMcpService } from '../dynamic-mcp/dynamic-mcp.service';
import type { CreateMcpAppDto } from './dto/create-mcp-app.dto';
import type { UpdateMcpAppDto } from './dto/update-mcp-app.dto';
import type { IMcpAppRepository, McpAppRecord, McpAppViewConfig, McpAppViewType } from './mcp-app.repository';

const VIEW_TYPES = new Set<McpAppViewType>(['table', 'cards', 'details', 'json']);

function resourceUri(appId: string): string {
  return `ui://arthur/apps/${appId}/view.html`;
}

@Injectable()
export class McpAppsService {
  constructor(
    @Inject(MCP_APP_REPO) private readonly appRepo: IMcpAppRepository,
    @Inject(PROJECT_REPO) private readonly projectRepo: ISwaggerProjectRepository,
    private readonly dynamicMcp: DynamicMcpService,
  ) {}

  private normalizeViewConfig(config?: McpAppViewConfig): McpAppViewConfig {
    return {
      ...(config?.dataPath?.trim() ? { dataPath: config.dataPath.trim() } : {}),
      ...(config?.columns?.length ? { columns: config.columns.map((column) => column.trim()).filter(Boolean) } : {}),
      ...(config?.titleField?.trim() ? { titleField: config.titleField.trim() } : {}),
      ...(config?.subtitleField?.trim() ? { subtitleField: config.subtitleField.trim() } : {}),
      ...(config?.emptyMessage?.trim() ? { emptyMessage: config.emptyMessage.trim() } : {}),
    };
  }

  private async requireSource(serverId: string, toolName: string): Promise<SwaggerProjectRecord> {
    const server = await this.projectRepo.findById(serverId);
    if (!server) throw new BadRequestException('Selected data source was not found.');
    const tool = (server.tools ?? []).find((candidate) => candidate.name === toolName && candidate.enabled !== false);
    if (!tool) throw new BadRequestException('Selected tool is not available on this data source.');
    return server;
  }

  private async toResponse(app: McpAppRecord) {
    const server = await this.projectRepo.findById(app.serverId);
    const tool = server?.tools?.find((candidate) => candidate.name === app.toolName);
    return {
      ...app,
      resourceUri: resourceUri(app.id),
      serverName: server?.name ?? 'Deleted data source',
      serverShareSlug: server?.shareSlug ?? undefined,
      toolDescription: tool?.description,
      inputSchema: tool?.inputSchema,
      outputSchema: tool?.outputSchema,
    };
  }

  async findAll() {
    return Promise.all((await this.appRepo.findAll()).map((app) => this.toResponse(app)));
  }

  async findOne(id: string) {
    const app = await this.appRepo.findById(id);
    if (!app) throw new NotFoundException(`MCP App ${id} not found.`);
    return this.toResponse(app);
  }

  async listSources() {
    const servers = await this.projectRepo.findAll();
    return servers.map((server) => ({
      id: server._id,
      name: server.name,
      description: server.description,
      tags: server.tags ?? [],
      tools: (server.tools ?? []).filter((tool) => tool.enabled !== false).map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
      })),
    }));
  }

  async create(dto: CreateMcpAppDto) {
    if (!dto.name?.trim()) throw new BadRequestException('App name is required.');
    if (!dto.serverId || !dto.toolName) throw new BadRequestException('Data source and tool are required.');
    if (!VIEW_TYPES.has(dto.viewType)) throw new BadRequestException('Unsupported App view type.');
    await this.requireSource(dto.serverId, dto.toolName);
    if (await this.appRepo.findByServerAndTool(dto.serverId, dto.toolName)) {
      throw new ConflictException('This tool already has an MCP App. Edit the existing App instead.');
    }
    const app = await this.appRepo.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || undefined,
      serverId: dto.serverId,
      toolName: dto.toolName,
      viewType: dto.viewType,
      viewConfig: this.normalizeViewConfig(dto.viewConfig),
      isActive: dto.isActive ?? true,
    });
    this.dynamicMcp.invalidate(dto.serverId);
    return this.toResponse(app);
  }

  async update(id: string, dto: UpdateMcpAppDto) {
    const current = await this.appRepo.findById(id);
    if (!current) throw new NotFoundException(`MCP App ${id} not found.`);
    if (dto.name !== undefined && !dto.name.trim()) throw new BadRequestException('App name is required.');
    if (dto.viewType !== undefined && !VIEW_TYPES.has(dto.viewType)) throw new BadRequestException('Unsupported App view type.');
    const serverId = dto.serverId ?? current.serverId;
    const toolName = dto.toolName ?? current.toolName;
    await this.requireSource(serverId, toolName);
    const duplicate = await this.appRepo.findByServerAndTool(serverId, toolName);
    if (duplicate && duplicate.id !== id) throw new ConflictException('This tool already has an MCP App.');
    const updated = await this.appRepo.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() || undefined } : {}),
      ...(dto.serverId !== undefined ? { serverId } : {}),
      ...(dto.toolName !== undefined ? { toolName } : {}),
      ...(dto.viewType !== undefined ? { viewType: dto.viewType } : {}),
      ...(dto.viewConfig !== undefined ? { viewConfig: this.normalizeViewConfig(dto.viewConfig) } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    });
    if (!updated) throw new NotFoundException(`MCP App ${id} not found.`);
    this.dynamicMcp.invalidate(current.serverId);
    if (serverId !== current.serverId) this.dynamicMcp.invalidate(serverId);
    return this.toResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const current = await this.appRepo.findById(id);
    if (!current) throw new NotFoundException(`MCP App ${id} not found.`);
    await this.appRepo.delete(id);
    this.dynamicMcp.invalidate(current.serverId);
  }
}
