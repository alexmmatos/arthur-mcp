import type { McpAppViewConfig } from './mcpAppViewConfig.interface'
import type { McpAppViewType } from './mcpAppViewType.type'

export interface McpApp {
  id: string
  name: string
  description?: string
  serverId: string
  serverName: string
  serverShareSlug?: string
  toolName: string
  toolDescription?: string
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  viewType: McpAppViewType
  viewConfig: McpAppViewConfig
  resourceUri: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
