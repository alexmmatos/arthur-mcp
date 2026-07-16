import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, CircularProgress,
  FormControlLabel, Grid, Paper, Step, StepLabel, Stepper, Switch, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { IconArrowLeft, IconArrowRight, IconApps, IconCheck, IconDatabase, IconTool } from '@tabler/icons-react'
import api from '../../api'
import { HelpButton } from '../../components'
import { Permission, useAuth } from '../../context/auth'
import { MCP_APP_VIEW_TYPES, type McpApp, type McpAppSource } from '../../features/apps'
import type { NewAppForm } from './newAppForm.interface'

export default function NewApp() {
  const navigate = useNavigate()
  const { t } = useTranslation(['apps', 'common'])
  const { can, loading: authLoading } = useAuth()
  const [sources, setSources] = useState<McpAppSource[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState('')
  const [form, setForm] = useState<NewAppForm>({
    name: '', description: '', serverId: '', toolName: '', viewType: 'table', viewConfig: {}, isActive: true,
  })
  const selectedSource = useMemo(() => sources.find((source) => source.id === form.serverId), [sources, form.serverId])
  const selectedTool = selectedSource?.tools.find((tool) => tool.name === form.toolName)
  const steps = ['source', 'tool', 'view', 'review'].map((step) => t(`create.steps.${step}`))

  useEffect(() => {
    if (authLoading) return
    if (!can(Permission.AppsCreate)) { setLoading(false); return }
    api.get<McpAppSource[]>('/mcp-apps/sources').then((response) => setSources(response.data))
      .catch(() => setError(t('error.load'))).finally(() => setLoading(false))
  }, [authLoading, can, t])

  const selectSource = (source: McpAppSource) => {
    setForm((current) => ({ ...current, serverId: source.id, toolName: '' }))
    setError('')
  }

  const setViewConfig = (key: keyof NewAppForm['viewConfig'], value: string | string[]) => {
    setForm((current) => ({ ...current, viewConfig: { ...current.viewConfig, [key]: value } }))
  }

  const canContinue = activeStep === 0 ? Boolean(form.serverId) : activeStep === 1 ? Boolean(form.toolName) : activeStep === 2 ? Boolean(form.name.trim()) : true
  const handleNext = () => {
    if (!canContinue) {
      setError(t(activeStep === 0 ? 'error.sourceRequired' : activeStep === 1 ? 'error.toolRequired' : 'error.nameRequired'))
      return
    }
    setError(''); setActiveStep((step) => step + 1)
  }
  const handleCreate = async () => {
    setSaving(true); setError('')
    try {
      const { data } = await api.post<McpApp>('/mcp-apps', form)
      navigate(`/apps/${data.id}`)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? t('error.saveFailed')); setSaving(false)
    }
  }

  if (!authLoading && !can(Permission.AppsCreate)) return <Box py={12} textAlign="center"><Typography color="text.secondary">{t('error.forbidden')}</Typography></Box>
  if (authLoading || loading) return <Box py={12} textAlign="center"><CircularProgress size={26} /></Box>

  return (
    <Box maxWidth={900} mx="auto">
      <Box display="flex" alignItems="center" gap={1} mb={4} flexWrap="wrap">
        <Button size="small" startIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/apps')}>{t('action.back')}</Button>
        <Typography variant="h5" fontWeight={700}>{t('create.title')}</Typography>
        <HelpButton title={t('help.title')}><Typography variant="body2" paragraph>{t('help.intro')}</Typography><Typography variant="body2" paragraph>{t('help.source')}</Typography><Typography variant="body2">{t('help.host')}</Typography></HelpButton>
      </Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>{steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>{error}</Alert>}

      {activeStep === 0 && <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography fontWeight={700}>{t('create.sourceTitle')}</Typography><Typography variant="body2" color="text.secondary" mb={3}>{t('create.sourceHint')}</Typography>
        {sources.length === 0 ? <Alert severity="info">{t('empty.noSources')}</Alert> : <Grid container spacing={2}>{sources.map((source) => <Grid item xs={12} sm={6} key={source.id}>
          <Card variant="outlined" sx={{ borderColor: form.serverId === source.id ? 'primary.main' : 'divider' }}><CardActionArea disabled={!source.tools.length} onClick={() => selectSource(source)}><CardContent>
            <Box display="flex" gap={1.25} alignItems="flex-start"><IconDatabase size={20} /><Box flex={1}><Typography fontWeight={650}>{source.name}</Typography><Typography variant="body2" color="text.secondary">{source.description}</Typography><Chip label={`${source.tools.length} Tools`} size="small" sx={{ mt: 1 }} /></Box>{form.serverId === source.id && <IconCheck color="currentColor" size={20} />}</Box>
          </CardContent></CardActionArea></Card>
        </Grid>)}</Grid>}
      </Paper>}

      {activeStep === 1 && <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography fontWeight={700}>{t('create.toolTitle')}</Typography><Typography variant="body2" color="text.secondary" mb={3}>{t('create.toolHint')}</Typography>
        {!selectedSource?.tools.length ? <Alert severity="info">{t('empty.noTools')}</Alert> : <Grid container spacing={2}>{selectedSource.tools.map((tool) => <Grid item xs={12} sm={6} key={tool.name}>
          <Card variant="outlined" sx={{ borderColor: form.toolName === tool.name ? 'primary.main' : 'divider' }}><CardActionArea onClick={() => { setForm((current) => ({ ...current, toolName: tool.name })); setError('') }}><CardContent>
            <Box display="flex" gap={1.25}><IconTool size={20} /><Box flex={1}><Typography fontWeight={650} fontFamily="monospace">{tool.name}</Typography><Typography variant="body2" color="text.secondary">{tool.description}</Typography></Box>{form.toolName === tool.name && <IconCheck size={20} />}</Box>
          </CardContent></CardActionArea></Card>
        </Grid>)}</Grid>}
      </Paper>}

      {activeStep === 2 && <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography fontWeight={700}>{t('create.viewTitle')}</Typography><Typography variant="body2" color="text.secondary" mb={3}>{t('create.viewHint')}</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField required fullWidth size="small" label={t('label.name')} placeholder={t('placeholder.name')} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />} label={t('label.active')} /></Grid>
          <Grid item xs={12}><TextField fullWidth size="small" multiline minRows={2} label={t('label.description')} placeholder={t('placeholder.description')} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Grid>
          <Grid item xs={12}><ToggleButtonGroup exclusive value={form.viewType} onChange={(_, value) => value && setForm((current) => ({ ...current, viewType: value }))} sx={{ flexWrap: 'wrap' }}>{MCP_APP_VIEW_TYPES.map((view) => <ToggleButton value={view} key={view} sx={{ textTransform: 'none' }}><Box textAlign="left"><Typography variant="body2" fontWeight={650}>{t(`view.${view}`)}</Typography><Typography variant="caption" color="text.secondary">{t(`view.${view}Hint`)}</Typography></Box></ToggleButton>)}</ToggleButtonGroup></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label={t('label.dataPath')} placeholder={t('placeholder.dataPath')} value={form.viewConfig.dataPath ?? ''} onChange={(event) => setViewConfig('dataPath', event.target.value)} /></Grid>
          {form.viewType === 'table' && <Grid item xs={12} sm={6}><TextField fullWidth size="small" label={t('label.columns')} placeholder={t('placeholder.columns')} value={form.viewConfig.columns?.join(', ') ?? ''} onChange={(event) => setViewConfig('columns', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))} /></Grid>}
          {form.viewType === 'cards' && <><Grid item xs={12} sm={6}><TextField fullWidth size="small" label={t('label.titleField')} placeholder={t('placeholder.titleField')} value={form.viewConfig.titleField ?? ''} onChange={(event) => setViewConfig('titleField', event.target.value)} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth size="small" label={t('label.subtitleField')} placeholder={t('placeholder.subtitleField')} value={form.viewConfig.subtitleField ?? ''} onChange={(event) => setViewConfig('subtitleField', event.target.value)} /></Grid></>}
          <Grid item xs={12} sm={6}><TextField fullWidth size="small" label={t('label.emptyMessage')} placeholder={t('placeholder.emptyMessage')} value={form.viewConfig.emptyMessage ?? ''} onChange={(event) => setViewConfig('emptyMessage', event.target.value)} /></Grid>
        </Grid>
      </Paper>}

      {activeStep === 3 && <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography fontWeight={700}>{t('create.reviewTitle')}</Typography><Typography variant="body2" color="text.secondary" mb={3}>{t('create.reviewHint')}</Typography>
        <Grid container spacing={2}><Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">{t('label.name')}</Typography><Typography>{form.name}</Typography></Grid><Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">{t('label.source')}</Typography><Typography>{selectedSource?.name}</Typography></Grid><Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">{t('label.tool')}</Typography><Typography fontFamily="monospace">{selectedTool?.name}</Typography></Grid><Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">{t('label.viewType')}</Typography><Typography>{t(`view.${form.viewType}`)}</Typography></Grid></Grid>
      </Paper>}

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button disabled={activeStep === 0 || saving} startIcon={<IconArrowLeft size={17} />} onClick={() => { setError(''); setActiveStep((step) => step - 1) }}>{t('action.previous')}</Button>
        {activeStep < 3 ? <Button variant="contained" endIcon={<IconArrowRight size={17} />} onClick={handleNext}>{t('action.next')}</Button> : <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <IconApps size={17} />} disabled={saving} onClick={handleCreate}>{t('action.create')}</Button>}
      </Box>
    </Box>
  )
}
