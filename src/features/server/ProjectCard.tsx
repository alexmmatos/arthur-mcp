import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  IconCopy,
  IconLabel,
  IconTrash,
} from '@tabler/icons-react'
import { Permission, useAuth } from '../../context/AuthContext'
import type { HealthEntry, Project } from './types'

function TrafficLight({ health, isPaused }: { health?: HealthEntry; isPaused?: boolean }) {
  const { t } = useTranslation('servers')

  if (isPaused) {
    return (
      <Tooltip title={t('status.pausedByManager')}>
        <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0, border: '1.5px solid', borderColor: 'text.secondary' }} />
      </Tooltip>
    )
  }

  if (!health || health.totalCalls === 0) {
    return (
      <Tooltip title={t('status.noActivity')}>
        <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: 'action.disabledBackground', flexShrink: 0, border: '1.5px solid', borderColor: 'action.disabled' }} />
      </Tooltip>
    )
  }

  const color = health.errorRatePct === 0 ? 'success.main' : health.errorRatePct < 20 ? 'warning.main' : 'error.main'
  const border = health.errorRatePct === 0 ? 'success.dark' : health.errorRatePct < 20 ? 'warning.dark' : 'error.dark'
  const label = health.errorRatePct === 0
    ? t('status.requestsSucceeded', { count: health.totalCalls })
    : t('status.errorRate', { rate: health.errorRatePct, count: health.totalCalls })

  return (
    <Tooltip title={label}>
      <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: color, flexShrink: 0, border: '1.5px solid', borderColor: border }} />
    </Tooltip>
  )
}

export function ProjectCard({ p, health, onDelete, onDuplicate }: {
  p: Project
  health?: HealthEntry
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const navigate = useNavigate()
  const { can } = useAuth()
  const { t } = useTranslation('servers')

  return (
    <Paper
      variant="outlined"
      onClick={() => navigate(`/servers/${p._id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        opacity: p.isPaused ? 0.8 : 1,
        transition: 'border-color 0.15s',
        '&:hover': {
          borderColor: 'primary.main',
          '& .card-actions': { opacity: 1 },
        },
      }}
    >
      <Box
        className="card-actions"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          display: 'flex',
          gap: 0.25,
          opacity: 0,
          transition: 'opacity 0.15s',
        }}
      >
        {can(Permission.ServersCreate) && (
          <Tooltip title={t('common:action.duplicate')}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDuplicate(p._id) }}
              sx={{ p: 0.5, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <IconCopy size={15} />
            </IconButton>
          </Tooltip>
        )}
        {can(Permission.ServersDelete) && (
          <Tooltip title={t('common:action.delete')}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(p._id) }}
              sx={{ p: 0.5, bgcolor: 'background.paper', color: 'text.disabled', '&:hover': { bgcolor: 'action.hover', color: 'error.main' } }}
            >
              <IconTrash size={15} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, pr: 5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5} minWidth={0}>
          <TrafficLight health={health} isPaused={p.isPaused} />
          <Typography fontWeight={700} fontSize="0.9375rem" noWrap lineHeight={1.3}>
            {p.name}
          </Typography>
        </Box>

        {p.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
            mb={0.75}
            sx={{
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {p.description}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          mb={1}
          fontFamily="monospace"
          fontSize="0.72rem"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {p.baseUrl}
        </Typography>

        <Box display="flex" gap={0.75} flexWrap="wrap" alignItems="center">
          {p.isPaused
            ? <Chip label={t('status.paused')} size="small" color="default" sx={{ fontWeight: 600 }} />
            : <Chip
                label={p.status === 'active' ? t('status.active') : t('common:status.error')}
                size="small"
                color={p.status === 'active' ? 'success' : 'error'}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
          }
          <Chip
            label={t('label.toolCount', { count: p.tools?.length ?? 0 })}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          {p.version && (
            <Chip label={`v${p.version}`} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
          )}
        </Box>

        {p.tags && p.tags.length > 0 && (
          <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.75}>
            {p.tags.map((tag) => (
              <Chip
                key={tag}
                icon={<IconLabel size={10} />}
                label={tag}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.68rem', height: 18 }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  )
}
