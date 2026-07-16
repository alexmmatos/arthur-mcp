import { Box, Chip, Typography } from '@mui/material'
import { IconApps, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { BaseListCard, type BaseListCardAction } from '../../../components'
import { Permission, useAuth } from '../../../context/auth'
import type { AppCardProps } from './appCardProps.interface'

export function AppCard({ app, onEdit, onDelete }: AppCardProps) {
  const { t } = useTranslation(['apps', 'common'])
  const { can } = useAuth()
  const actions: BaseListCardAction[] = can(Permission.AppsDelete) ? [{
    icon: <IconTrash size={15} />, tooltip: t('common:action.delete'),
    onClick: () => onDelete(app), color: 'error',
  }] : []

  return (
    <BaseListCard
      icon={<Box color="primary.main"><IconApps size={17} /></Box>}
      title={app.name}
      description={app.description}
      onClick={can(Permission.AppsEdit) ? () => onEdit(app) : undefined}
      disabled={!can(Permission.AppsEdit)}
      content={
        <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap" mt={0.5}>
          <Chip label={app.serverName} size="small" variant="outlined" sx={{ height: 21, fontSize: '0.7rem' }} />
          <Chip label={app.toolName} size="small" sx={{ height: 21, fontSize: '0.7rem', fontFamily: 'monospace' }} />
          <Chip label={t(`view.${app.viewType}`)} size="small" color="primary" variant="outlined" sx={{ height: 21, fontSize: '0.7rem' }} />
          {!app.isActive && <Chip label={t('label.inactive')} size="small" sx={{ height: 21, fontSize: '0.7rem' }} />}
        </Box>
      }
      footer={<Typography variant="caption" color="text.disabled">{t('label.updated', { date: new Date(app.updatedAt).toLocaleDateString() })}</Typography>}
      actions={actions}
    />
  )
}
