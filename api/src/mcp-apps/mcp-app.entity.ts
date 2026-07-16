import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { McpAppViewConfig, McpAppViewType } from './mcp-app.repository';

@Entity('mcp_apps')
@Index('uq_mcp_apps_server_tool', ['serverId', 'toolName'], { unique: true })
export class McpAppEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' }) id: string;
  @Column({ name: 'name' }) name: string;
  @Column({ name: 'description', nullable: true }) description?: string;
  @Index('idx_mcp_apps_server_id')
  @Column({ name: 'server_id' }) serverId: string;
  @Column({ name: 'tool_name' }) toolName: string;
  @Column({ name: 'view_type' }) viewType: McpAppViewType;
  @Column('simple-json', { name: 'view_config', default: '{}' }) viewConfig: McpAppViewConfig;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
