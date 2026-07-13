import type { Project } from '../types'

export interface ProjectCardProps {
  p: Project
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}
