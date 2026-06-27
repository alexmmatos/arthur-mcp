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
  IconMessage2,
  IconTag,
  IconTrash,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { Prompt } from './types'

export function PromptCard({ prompt, onEdit, onCopy, onDelete, canEdit, canDelete, copied }: {
  prompt: Prompt
  onEdit: (prompt: Prompt) => void
  onCopy: (prompt: Prompt) => void
  onDelete: (prompt: Prompt) => void
  canEdit: boolean
  canDelete: boolean
  copied: boolean
}) {
  const { t } = useTranslation('prompts')

  return (
    <Paper
      variant="outlined"
      onClick={canEdit ? () => onEdit(prompt) : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color 0.15s',
        cursor: canEdit ? 'pointer' : 'default',
        '&:hover': {
          borderColor: 'primary.main',
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
        <Tooltip title={copied ? t('toast.copied') : t('filter.copyContent')}>
          <IconButton size="small"
            onClick={(e) => { e.stopPropagation(); onCopy(prompt) }}
            color={copied ? 'success' : 'default'}
            sx={{ p: 0.5, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
            <IconCopy size={15} />
          </IconButton>
        </Tooltip>
        {canDelete && (
          <Tooltip title={t('filter.delete')}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(prompt) }}
              sx={{ p: 0.5, bgcolor: 'background.paper', color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'action.hover' } }}
            >
              <IconTrash size={15} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, pr: 5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Box sx={{ color: 'primary.main', flexShrink: 0 }}><IconMessage2 size={16} /></Box>
          <Typography fontWeight={700} fontSize="0.9375rem" noWrap lineHeight={1.3}>
            {prompt.name}
          </Typography>
        </Box>

        {prompt.description && (
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
            {prompt.description}
          </Typography>
        )}

        <Box sx={{ bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}>
          <Typography
            variant="caption"
            fontFamily="monospace"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              fontSize: '0.72rem',
              lineHeight: 1.5,
            }}
          >
            {prompt.content}
          </Typography>
        </Box>

        {prompt.tags.length > 0 && (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {prompt.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                icon={<IconTag size={10} />}
                sx={{ fontSize: '0.68rem', height: 18, '& .MuiChip-icon': { ml: '4px', mr: '-2px' } }}
              />
            ))}
          </Box>
        )}

        <Typography variant="caption" color="text.disabled" display="block" mt={1}>
          {prompt.content.length} chars
          {prompt.updatedAt && ` · ${t('label.updatedDate', { date: new Date(prompt.updatedAt).toLocaleDateString() })}`}
        </Typography>
      </Box>
    </Paper>
  )
}