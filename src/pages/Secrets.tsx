import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  IconPlus,
  IconLock,
  IconSearch,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import api from '../api'
import { Permission, useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import AppSnackbar from '../components/AppSnackbar'
import { SecretCard } from '../features/secrets/SecretCard'
import type { Secret } from '../features/secrets/types'

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Secrets() {
  const { t } = useTranslation('secrets')
  const navigate = useNavigate()
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Secret | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [snack, setSnack] = useState<{ message: string; severity?: 'success' | 'error' } | null>(null)
  const { can, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!can(Permission.SecretsViewNames)) { setLoading(false); return }
    api.get<Secret[]>('/secrets')
      .then((r) => setSecrets(r.data))
      .catch(() => setSnack({ message: t('error.loadFailed'), severity: 'error' }))
      .finally(() => setLoading(false))
  }, [authLoading])

  const visible = search
    ? secrets.filter((s) => {
        const q = search.toLowerCase()
        return s.name.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q)
      })
    : secrets

  const openCreate = () => navigate('/secrets/new')
  const openEdit = (s: Secret) => navigate(`/secrets/${s.id}`)

  const handleCopy = async (s: Secret) => {
    try {
      const { data } = await api.get<{ value: string }>(`/secrets/${s.id}/value`)
      await navigator.clipboard.writeText(data.value)
      setCopiedId(s.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      setSnack({ message: t('error.copyFailed'), severity: 'error' })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/secrets/${deleteTarget.id}`)
      setSecrets((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setSnack({ message: t('toast.deleted'), severity: 'success' })
      setDeleteTarget(null)
    } catch {
      setSnack({ message: t('error.deleteFailed'), severity: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" fontWeight={700}>{t('heading.title')}</Typography>
          <Tooltip title={<span>{t('heading.subtitle')}</span>}>
            <IconButton size="small" sx={{ color: 'text.disabled' }}>
              <IconLock size={16} />
            </IconButton>
          </Tooltip>
        </Box>
        {can(Permission.SecretsCreate) && (
          <Button size="small" variant="contained" startIcon={<IconPlus size={18} />} onClick={openCreate}>
            {t('action.newSecret')}
          </Button>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <TextField
          size="small" placeholder={t('placeholder.searchSecrets')} value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment>,
          }}
        />
        {search && (
          <Typography variant="body2" color="text.secondary">
            {visible.length} of {secrets.length}
          </Typography>
        )}
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : secrets.length === 0 ? (
        <Box py={6} textAlign="center">
          <Typography color="text.secondary" variant="body2">{t('empty.noSecretsSimple')}</Typography>
        </Box>
      ) : visible.length === 0 ? (
        <Box py={6} textAlign="center">
          <Typography color="text.secondary" variant="body2">{t('empty.noMatch')}</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {visible.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <SecretCard
                secret={s}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onCopy={handleCopy}
                copied={copiedId === s.id}
              />
            </Grid>
          ))}
        </Grid>
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('confirm.deleteTitle', { name: deleteTarget?.name ?? '' })}
        message={t('confirm.deleteMessage')}
        confirmLabel={t('common:action.delete')} confirmColor="error" loading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />

      <AppSnackbar
        open={snack !== null}
        message={snack?.message ?? ''}
        severity={snack?.severity ?? 'success'}
        onClose={() => setSnack(null)}
      />
    </Box>
  )
}
