import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  IconPlus,
  IconTrash,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconLock,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import api from '../api'
import { useAuth, Permission } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import AppSnackbar from '../components/AppSnackbar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Secret {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

// ─── Secret card ──────────────────────────────────────────────────────────────

function SecretCard({ secret, onEdit, onDelete, onCopy, copied }: {
  secret: Secret
  onEdit: (s: Secret) => void
  onDelete: (s: Secret) => void
  onCopy: (s: Secret) => Promise<void>
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

// ─── Create / Edit dialog ─────────────────────────────────────────────────────

interface SecretForm {
  name: string
  value: string
  description: string
}

function SecretDialog({
  open,
  editTarget,
  onClose,
  onSaved,
}: {
  open: boolean
  editTarget: Secret | null
  onClose: () => void
  onSaved: (s: Secret, isNew: boolean) => void
}) {
  const { t } = useTranslation('secrets')
  const empty = (): SecretForm => ({ name: '', value: '', description: '' })
  const [form, setForm] = useState<SecretForm>(empty())
  const [showValue, setShowValue] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(editTarget
        ? { name: editTarget.name, value: '', description: editTarget.description ?? '' }
        : empty()
      )
      setError('')
      setShowValue(false)
    }
  }, [open, editTarget])

  const setField = <K extends keyof SecretForm>(k: K, v: SecretForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError(t('error.nameRequired')); return }
    if (!form.value.trim()) { setError(t('error.valueRequired')); return }
    setSaving(true); setError('')
    try {
      const dto = {
        name: form.name.trim(),
        value: form.value,
        description: form.description.trim() || undefined,
      }
      if (editTarget) {
        const { data } = await api.patch<Secret>(`/secrets/${editTarget.id}`, dto)
        onSaved(data, false)
      } else {
        const { data } = await api.post<Secret>('/secrets', dto)
        onSaved(data, true)
      }
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('error.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 560 }, display: 'flex', flexDirection: 'column' } }}>
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={700} flexGrow={1}>
          {editTarget ? `Edit — ${editTarget.name}` : t('action.newSecret')}
        </Typography>
        <IconButton size="small" onClick={onClose}><IconX size={18} /></IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            size="small" fullWidth required label={t('common:label.name')} value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder={t('placeholder.secretName')}
            helperText={t('hint.referenceUsage')}
            disabled={!!editTarget}
          />
          <TextField
            size="small" fullWidth required label={t('common:label.value')} value={form.value}
            type={showValue ? 'text' : 'password'}
            onChange={(e) => setField('value', e.target.value)}
            placeholder={t('placeholder.secretValue')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={t('action.toggleVisibility')}>
                    <IconButton size="small" onClick={() => setShowValue((v) => !v)} edge="end">
                      {showValue ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small" fullWidth multiline minRows={4} label={t('label.description')} value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder={t('placeholder.description')}
          />
        </Box>
      </Box>
      <Box sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, flexShrink: 0 }}>
        <Button onClick={onClose} disabled={saving}>{t('common:action.cancel')}</Button>
        <Button
          variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {saving ? t('common:action.saving') : editTarget ? t('action.saveChanges') : t('action.createSecret')}
        </Button>
      </Box>
    </Drawer>
    </>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Secrets() {
  const { t } = useTranslation('secrets')
  const navigate = useNavigate()
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Secret | null>(null)
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

  const handleSaved = (saved: Secret, isNew: boolean) => {
    setSecrets((prev) =>
      isNew ? [saved, ...prev] : prev.map((s) => s.id === saved.id ? saved : s)
    )
    setSnack({ message: isNew ? t('toast.saved') : t('toast.updated'), severity: 'success' })
  }

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

      <SecretDialog
        open={dialogOpen}
        editTarget={editTarget}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />

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
