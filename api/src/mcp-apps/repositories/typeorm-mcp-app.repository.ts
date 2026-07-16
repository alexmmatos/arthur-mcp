import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { McpAppEntity } from '../mcp-app.entity';
import type { IMcpAppRepository, McpAppRecord } from '../mcp-app.repository';

@Injectable()
export class TypeOrmMcpAppRepository implements IMcpAppRepository {
  constructor(@InjectRepository(McpAppEntity) private readonly repo: Repository<McpAppEntity>) {}

  private toRecord(entity: McpAppEntity): McpAppRecord {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      serverId: entity.serverId,
      toolName: entity.toolName,
      viewType: entity.viewType,
      viewConfig: entity.viewConfig ?? {},
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async findAll(): Promise<McpAppRecord[]> {
    return (await this.repo.find({ order: { createdAt: 'DESC' } })).map((entity) => this.toRecord(entity));
  }

  async findById(id: string): Promise<McpAppRecord | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toRecord(entity) : null;
  }

  async findByServerId(serverId: string): Promise<McpAppRecord[]> {
    return (await this.repo.find({ where: { serverId }, order: { createdAt: 'ASC' } }))
      .map((entity) => this.toRecord(entity));
  }

  async findByServerAndTool(serverId: string, toolName: string): Promise<McpAppRecord | null> {
    const entity = await this.repo.findOne({ where: { serverId, toolName } });
    return entity ? this.toRecord(entity) : null;
  }

  async create(data: Omit<McpAppRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<McpAppRecord> {
    return this.toRecord(await this.repo.save(this.repo.create(data)));
  }

  async update(id: string, data: Partial<Omit<McpAppRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<McpAppRecord | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    Object.assign(entity, data);
    return this.toRecord(await this.repo.save(entity));
  }

  async delete(id: string): Promise<boolean> {
    return (await this.repo.delete(id)).affected === 1;
  }
}
