import type { PromptTemplate } from '../../data/prompt-templates'

export interface PromptTemplateCardProps { template: PromptTemplate; onUse: (t: PromptTemplate) => void }
