import type { McpAppSourceTool } from './mcpAppSourceTool.interface'

export interface McpAppSource {
  id: string
  name: string
  description?: string
  tags: string[]
  tools: McpAppSourceTool[]
}
