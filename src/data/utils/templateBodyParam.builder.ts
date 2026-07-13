import type { TemplateParam } from '../templateParam.interface'

export function templateBodyParam(
  name: string,
  type: TemplateParam['type'],
  description: string,
  required = false,
): TemplateParam {
  return { name, in: 'body', required, type, description }
}
