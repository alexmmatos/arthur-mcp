import type { McpAppViewConfig, McpAppViewType } from '../../features/apps'

export interface NewAppForm {
  name: string
  description: string
  serverId: string
  toolName: string
  viewType: McpAppViewType
  viewConfig: McpAppViewConfig
  isActive: boolean
}
