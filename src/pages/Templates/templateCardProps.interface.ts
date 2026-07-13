import type { ApiTemplate } from '../../data/api-templates'

export interface TemplateCardProps { template: ApiTemplate; onUse: (tmpl: ApiTemplate) => void }
