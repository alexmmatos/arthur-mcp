import { useState } from 'react'
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  IconCopy,
  IconEye,
  IconEyeOff,
  IconLock,
  IconTrash,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import { Permission, useAuth } from '../../context/AuthContext'
import type { Secret } from './types'

export function SecretCard({ secret, onEdit, onDelete, onCopy, copied }: {
  secret: Secret
  onEdit: (secret: Secret) => void
  onDelete: (secret: Secret) => void
  onCopy: (secret: Secret) => Promise<void>
  copied: boolean
}) {
  const { t } = useTranslation('secrets')
  const [revealed, setRevealed] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  const [loadingValue, setLoadingValue] = useState(false)
  const { can } = useAuth()

  const canEdit = can(Permission.SecretsEdit)
  const canReveal = can(Permission.SecretsRevealValues)

  const loadValue = async () => {
    if (value !== null || loadingValue || !canReveal) return value
    setLoadingValue(true)
    try {
      const { data } = await api.get<{ value: string }>(`/secrets/${secret.id}/value`)
      setValue(data.value)
      return data.value
    } finally {
      setLoadingValue(false)
    }
  }

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(false)
      return
    }
    await loadValue()
    setRevealed(true)
  }

  return (
    <Paper
      variant="outlined"
      onClick={canEdit ? () => onEdit(secret) : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color 0.15s',
        cursor: canEdit ? 'pointer' : 'default',
        '&:hover': {
          borderColor: canEdit ? 'primary.main' : 'divider',
          '& .card-actions': { opacity: 1 },
        },
      }}
    >
      <Box
        className="card-actions"
        sx={{
          position: 'absolute', top: 8, right: 8, zIndex: 2,
          display: 'flex', gap: 0.25, opacity: 0, transition: 'opacity 0.15s',
        }}
      >
        {canReveal && (
          <Tooltip title={copied ? t('common:action.copied') : t('action.copyValue')}>
            <IconButton size="small"
              onClick={(e) => { e.stopPropagation(); onCopy(secret) }}
              color={copied ? 'success' : 'default'}
              sx={{ p: 0.5, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
              <IconCopy size={15} />
            </IconButton>
          </Tooltip>
        )}
        {can(Permission.SecretsDelete) && (
          <Tooltip title={t('common:action.delete')}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(secret) }}
              sx={{ p: 0.5, bgcolor: 'background.paper', color: 'text.disabled', '&:hover': { bgcolor: 'action.hover', color: 'error.main' } }}
            >
              <IconTrash size={15} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, pr: 5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Box sx={{ color: 'warning.main', flexShrink: 0 }}><IconLock size={16} /></Box>
          <Typography fontWeight={700} fontSize="0.9375rem" noWrap lineHeight={1.3}>
            {secret.name}
          </Typography>
        </Box>

        {secret.description && (
          <Typography
            variant="body2" color="text.secondary" mb={1}
            sx={{
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {secret.description}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" fontFamily="monospace" color="text.secondary">
            {revealed ? (value ?? t('common:action.loading')) : '••••••••••••'}
          </Typography>
          {canReveal && (
            <Tooltip title={revealed ? t('action.hide') : t('action.reveal')}>
              <IconButton size="small" onClick={handleReveal} disabled={loadingValue} sx={{ p: 0.25 }}>
                {revealed ? <IconEyeOff size={13} /> : <IconEye size={13} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box mt={1} sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '4px', px: 1, py: 0.25, display: 'inline-block' }}>
          <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontSize="0.68rem">
            {`{{secret:${secret.name}}}`}
          </Typography>
        </Box>

        <Typography variant="caption" color="text.disabled" display="block" mt={1}>
          {secret.updatedAt && t('label.updated', { date: new Date(secret.updatedAt).toLocaleDateString() })}
        </Typography>
      </Box>
    </Paper>
  )
}