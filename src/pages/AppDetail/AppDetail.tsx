import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Alert, Box, Button, Chip, CircularProgress, FormControlLabel, Grid, Link, Paper,
  Switch, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { IconArrowLeft, IconCopy, IconDeviceFloppy, IconExternalLink, IconTrash } from '@tabler/icons-react'
import api from '../../api'
import { AppSnackbar, ConfirmDialog, HelpButton } from '../../components'
import { backendUrl } from '../../config/urls'
import { Permission, useAuth } from '../../context/auth'
import { MCP_APP_VIEW_TYPES, type McpApp } from '../../features/apps'

export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation(['apps', 'common'])
  const { can, loading: authLoading } = useAuth()
  const [app, setApp] = useState<McpApp | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [snack, setSnack] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!can(Permission.AppsView) || !id) { setLoading(false); return }
    api.get<McpApp>(`/mcp-apps/${id}`).then((response) => setApp(response.data))
      .catch(() => setError(t('error.load'))).finally(() => setLoading(false))
  }, [authLoading, can, id, t])

  const setField = <K extends keyof McpApp>(key: K, value: McpApp[K]) => setApp((current) => current ? { ...current, [key]: value } : current)
  const setConfig = (key: keyof McpApp['viewConfig'], value: string | string[]) => setApp((current) => current ? { ...current, viewConfig: { ...current.viewConfig, [key]: value } } : current)
  const save = async () => {
    if (!app) return
    if (!app.name.trim()) { setError(t('error.nameRequired')); return }
    setSaving(true); setError('')
    try {
      const { data } = await api.patch<McpApp>(`/mcp-apps/${app.id}`, {
        name: app.name, description: app.description, viewType: app.viewType,
        viewConfig: app.viewConfig, isActive: app.isActive,
      })
      setApp(data); setSnack(t('success.saved'))
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? t('error.saveFailed'))
    } finally { setSaving(false) }
  }
  const remove = async () => {
    if (!app) return
    setDeleting(true)
    try { await api.delete(`/mcp-apps/${app.id}`); navigate('/apps') }
    catch { setError(t('error.deleteFailed')); setDeleting(false); setConfirmDelete(false) }
  }

  if (!authLoading && !can(Permission.AppsView)) return <Box py={12} textAlign="center"><Typography color="text.secondary">{t('error.forbidden')}</Typography></Box>
  if (authLoading || loading) return <Box py={12} textAlign="center"><CircularProgress size={26} /></Box>
  if (!app) return <Alert severity="error">{error || t('error.load')}</Alert>
  const identifier = app.serverShareSlug || app.serverId
  const connectionUrl = backendUrl(`/api/mcp/server/${identifier}`)
  const editable = can(Permission.AppsEdit)

  return (
    <Box maxWidth={1000} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={3} flexWrap="wrap">
        <Button size="small" startIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/apps')}>{t('action.back')}</Button>
        <Box flex={1}><Box display="flex" alignItems="center" gap={1}><Typography variant="h5" fontWeight={700}>{app.name}</Typography><Chip size="small" color={app.isActive ? 'success' : 'default'} label={t(app.isActive ? 'label.active' : 'label.inactive')} /></Box><Typography variant="body2" color="text.secondary">{app.serverName} · {app.toolName}</Typography></Box>
        <HelpButton title={t('help.title')}><Typography variant="body2" paragraph>{t('help.intro')}</Typography><Typography variant="body2" paragraph>{t('help.source')}</Typography><Typography variant="body2">{t('help.host')}</Typography></HelpButton>
        {can(Permission.AppsDelete) && <Button color="error" startIcon={<IconTrash size={17} />} onClick={() => setConfirmDelete(true)}>{t('action.delete')}</Button>}
      </Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography fontWeight={700} mb={2}>{t('detail.presentation')}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}><TextField disabled={!editable} required fullWidth size="small" label={t('label.name')} value={app.name} onChange={(event) => setField('name', event.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><FormControlLabel control={<Switch disabled={!editable} checked={app.isActive} onChange={(event) => setField('isActive', event.target.checked)} />} label={t('label.active')} /></Grid>
          <Grid item xs={12}><TextField disabled={!editable} fullWidth multiline minRows={2} size="small" label={t('label.description')} value={app.description ?? ''} onChange={(event) => setField('description', event.target.value)} /></Grid>
          <Grid item xs={12}><ToggleButtonGroup disabled={!editable} exclusive value={app.viewType} onChange={(_, value) => value && setField('viewType', value)}>{MCP_APP_VIEW_TYPES.map((view) => <ToggleButton key={view} value={view} sx={{ textTransform: 'none' }}>{t(`view.${view}`)}</ToggleButton>)}</ToggleButtonGroup></Grid>
          <Grid item xs={12} sm={6}><TextField disabled={!editable} fullWidth size="small" label={t('label.dataPath')} value={app.viewConfig.dataPath ?? ''} onChange={(event) => setConfig('dataPath', event.target.value)} /></Grid>
          {app.viewType === 'table' && <Grid item xs={12} sm={6}><TextField disabled={!editable} fullWidth size="small" label={t('label.columns')} value={app.viewConfig.columns?.join(', ') ?? ''} onChange={(event) => setConfig('columns', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))} /></Grid>}
          {app.viewType === 'cards' && <><Grid item xs={12} sm={6}><TextField disabled={!editable} fullWidth size="small" label={t('label.titleField')} value={app.viewConfig.titleField ?? ''} onChange={(event) => setConfig('titleField', event.target.value)} /></Grid><Grid item xs={12} sm={6}><TextField disabled={!editable} fullWidth size="small" label={t('label.subtitleField')} value={app.viewConfig.subtitleField ?? ''} onChange={(event) => setConfig('subtitleField', event.target.value)} /></Grid></>}
          <Grid item xs={12} sm={6}><TextField disabled={!editable} fullWidth size="small" label={t('label.emptyMessage')} value={app.viewConfig.emptyMessage ?? ''} onChange={(event) => setConfig('emptyMessage', event.target.value)} /></Grid>
        </Grid>
        {editable && <Button sx={{ mt: 3 }} variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={17} />} onClick={save}>{t('action.save')}</Button>}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography fontWeight={700}>{t('detail.publication')}</Typography><Typography variant="body2" color="text.secondary" mb={2}>{t('detail.publicationHint')}</Typography>
        <Typography variant="caption" color="text.secondary">{t('label.connectionUrl')}</Typography><Box display="flex" alignItems="center" gap={1} mb={2}><Typography fontFamily="monospace" variant="body2" sx={{ overflowWrap: 'anywhere' }}>{connectionUrl}</Typography><Button size="small" startIcon={<IconCopy size={15} />} onClick={() => navigator.clipboard.writeText(connectionUrl)}>{t('common:action.copy')}</Button></Box>
        <Typography variant="caption" color="text.secondary">{t('label.resourceUri')}</Typography><Typography fontFamily="monospace" variant="body2" sx={{ overflowWrap: 'anywhere', mb: 2 }}>{app.resourceUri}</Typography>
        <Link component="button" onClick={() => navigate(`/servers/${app.serverId}`)} underline="hover" display="flex" alignItems="center" gap={0.5}>{t('action.openSource')} <IconExternalLink size={14} /></Link>
      </Paper>

      <ConfirmDialog open={confirmDelete} title={t('confirm.deleteTitle', { name: app.name })} message={t('confirm.deleteMessage')} confirmLabel={t('action.delete')} confirmColor="error" loading={deleting} onConfirm={remove} onClose={() => setConfirmDelete(false)} />
      <AppSnackbar open={Boolean(snack)} message={snack} severity="success" onClose={() => setSnack('')} />
    </Box>
  )
}
