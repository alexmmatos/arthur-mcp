import type { McpApp } from '../types'

export interface AppCardProps {
  app: McpApp
  onEdit: (app: McpApp) => void
  onDelete: (app: McpApp) => void
}
