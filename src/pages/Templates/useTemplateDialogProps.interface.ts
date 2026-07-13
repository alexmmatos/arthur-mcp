import type { ApiTemplate } from '../../data/api-templates'

export interface UseTemplateDialogProps {
  template: ApiTemplate
  onClose: () => void
}
