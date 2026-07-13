import type { TemplateParam } from '../templateParam.interface'

export function templatePathParam(
  name: string,
  type: TemplateParam['type'],
  description: string,
  originalName?: string,
): TemplateParam {
  return { name, in: 'path', required: true, type, description, ...(originalName ? { originalName } : {}) }
}
