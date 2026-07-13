import type { TemplateParam } from '../templateParam.interface'

export function templateQueryParam(
  name: string,
  type: TemplateParam['type'],
  description: string,
  required = false,
  originalName?: string,
): TemplateParam {
  return { name, in: 'query', required, type, description, ...(originalName ? { originalName } : {}) }
}
