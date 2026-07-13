import { API_TEMPLATES } from '../../data/api-templates'
import { SOURCE_DISPLAY } from './sourceDisplay.constant'
import { getSourceType } from './getSourceType.util'

/** Uses the matching template's own icon/color when the project was created from one (`template:<name>` tag), falling back to the generic source-type icon otherwise. */
export function getProjectIcon(project: { tags?: string[] }): { label: string; emoji: string; color: string } {
  const templateTag = (project.tags ?? []).find(t => t.startsWith('template:'))
  const templateName = templateTag?.slice('template:'.length)
  const template = templateName ? API_TEMPLATES.find(t => t.name === templateName) : undefined
  if (template) return { label: template.name, emoji: template.emoji, color: template.color }
  return SOURCE_DISPLAY[getSourceType(project)]
}
