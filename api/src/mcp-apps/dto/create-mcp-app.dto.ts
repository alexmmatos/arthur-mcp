import type { McpAppViewConfig, McpAppViewType } from '../mcp-app.repository';

export class CreateMcpAppDto {
  name: string;
  description?: string;
  serverId: string;
  toolName: string;
  viewType: McpAppViewType;
  viewConfig?: McpAppViewConfig;
  isActive?: boolean;
}
