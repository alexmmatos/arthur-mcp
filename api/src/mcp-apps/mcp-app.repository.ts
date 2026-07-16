export type McpAppViewType = 'table' | 'cards' | 'details' | 'json';

export interface McpAppViewConfig {
  dataPath?: string;
  columns?: string[];
  titleField?: string;
  subtitleField?: string;
  emptyMessage?: string;
}

export interface McpAppRecord {
  id: string;
  name: string;
  description?: string;
  serverId: string;
  toolName: string;
  viewType: McpAppViewType;
  viewConfig: McpAppViewConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMcpAppRepository {
  findAll(): Promise<McpAppRecord[]>;
  findById(id: string): Promise<McpAppRecord | null>;
  findByServerId(serverId: string): Promise<McpAppRecord[]>;
  findByServerAndTool(serverId: string, toolName: string): Promise<McpAppRecord | null>;
  create(data: Omit<McpAppRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<McpAppRecord>;
  update(id: string, data: Partial<Omit<McpAppRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<McpAppRecord | null>;
  delete(id: string): Promise<boolean>;
}
