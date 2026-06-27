import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  IconDeviceFloppy,
  IconMail,
  IconWorld,
  IconClock,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import api from '../api'
import { useAuth, Permission } from '../context/AuthContext'
import { useTerminology } from '../context/TerminologyContext'
import HelpButton from '../components/HelpButton'
import AppSnackbar from '../components/AppSnackbar'
import { GlobalRequestHeadersPanel, type HeaderEntry } from '../features/settings/GlobalRequestHeadersPanel'
import { TerminologyPanel } from '../features/settings/TerminologyPanel'

interface SettingsData {
  serverBaseUrl: string
  defaultTimeoutMs: number
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpFrom: string
  smtpPassSet: boolean
  globalRequestHeaders?: { name: string; value: string }[]
  termServer?: string
  termTool?: string
  termResource?: string
  termPrompt?: string
  termChain?: string
  termSecret?: string
}

function emailValid(v: string) {
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function portValid(v: number) {
  return v >= 1 && v <= 65535
}

export default function Settings() {
  const { can, loading: authLoading } = useAuth()
  const { reload: reloadTerminology } = useTerminology()
  const { t } = useTranslation('settings')
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success')

  const showSnack = (msg: string, sev: 'success' | 'error') => {
    setSnackMsg(msg); setSnackSeverity(sev); setSnackOpen(true)
  }

  // Main form state
  const [serverBaseUrl, setServerBaseUrl] = useState('')
  const [defaultTimeoutMs, setDefaultTimeoutMs] = useState(30000)
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpFrom, setSmtpFrom] = useState('')
  const [globalHeaders, setGlobalHeaders] = useState<HeaderEntry[]>([])

  // Terminology state
  const [termServer, setTermServer] = useState('')
  const [termTool, setTermTool] = useState('')
  const [termResource, setTermResource] = useState('')
  const [termPrompt, setTermPrompt] = useState('')
  const [termChain, setTermChain] = useState('')
  const [termSecret, setTermSecret] = useState('')
  const [savingTerms, setSavingTerms] = useState(false)

  const addGlobalHeader = () =>
    setGlobalHeaders((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: '', value: '' }])
  const removeGlobalHeader = (id: string) =>
    setGlobalHeaders((prev) => prev.filter((h) => h.id !== id))
  const setGlobalHeader = (id: string, field: 'name' | 'value', val: string) =>
    setGlobalHeaders((prev) => prev.map((h) => h.id === id ? { ...h, [field]: val } : h))

  const [orig, setOrig] = useState<Omit<SettingsData, 'smtpPassSet'> & { smtpPass: string; globalRequestHeaders: { name: string; value: string }[] } | null>(null)

  useEffect(() => {
    api.get<SettingsData>('/settings')
      .then((r) => {
        setData(r.data)
        setServerBaseUrl(r.data.serverBaseUrl || '')
        setDefaultTimeoutMs(r.data.defaultTimeoutMs || 30000)
        setSmtpHost(r.data.smtpHost || '')
        setSmtpPort(r.data.smtpPort || 587)
        setSmtpUser(r.data.smtpUser || '')
        setSmtpFrom(r.data.smtpFrom || '')
        setGlobalHeaders((r.data.globalRequestHeaders ?? []).map((h) => ({ id: Math.random().toString(36).slice(2), ...h })))
        setTermServer(r.data.termServer || '')
        setTermTool(r.data.termTool || '')
        setTermResource(r.data.termResource || '')
        setTermPrompt(r.data.termPrompt || '')
        setTermChain(r.data.termChain || '')
        setTermSecret(r.data.termSecret || '')
        setOrig({
          serverBaseUrl: r.data.serverBaseUrl || '',
          defaultTimeoutMs: r.data.defaultTimeoutMs || 30000,
          smtpHost: r.data.smtpHost || '',
          smtpPort: r.data.smtpPort || 587,
          smtpUser: r.data.smtpUser || '',
          smtpFrom: r.data.smtpFrom || '',
          smtpPass: '',
          globalRequestHeaders: r.data.globalRequestHeaders ?? [],
        })
      })
      .catch(() => showSnack(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [])

  const isDirty = orig !== null && (
    serverBaseUrl !== orig.serverBaseUrl ||
    defaultTimeoutMs !== orig.defaultTimeoutMs ||
    smtpHost !== orig.smtpHost ||
    smtpPort !== orig.smtpPort ||
    smtpUser !== orig.smtpUser ||
    smtpFrom !== orig.smtpFrom ||
    smtpPass !== '' ||
    JSON.stringify(globalHeaders.map((h) => ({ name: h.name, value: h.value }))) !== JSON.stringify(orig.globalRequestHeaders)
  )

  const smtpFromError = !emailValid(smtpFrom)
  const smtpPortError = !portValid(smtpPort)

  const handleSave = async () => {
    if (smtpFromError || smtpPortError) {
      showSnack(t('saveValidationError'), 'error')
      return
    }
    setSaving(true)
    try {
      const cleanHeaders = globalHeaders.filter((h) => h.name.trim()).map((h) => ({ name: h.name.trim(), value: h.value }))
      const dto: Record<string, unknown> = {
        serverBaseUrl: serverBaseUrl.trim(),
        defaultTimeoutMs: Number(defaultTimeoutMs),
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort),
        smtpUser: smtpUser.trim(),
        smtpFrom: smtpFrom.trim(),
        globalRequestHeaders: cleanHeaders,
      }
      if (smtpPass) dto.smtpPass = smtpPass
      await api.patch('/settings', dto)
      showSnack(t('saveSuccess'), 'success')
      setSmtpPass('')
      setOrig({
        serverBaseUrl: serverBaseUrl.trim(),
        defaultTimeoutMs: Number(defaultTimeoutMs),
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort),
        smtpUser: smtpUser.trim(),
        smtpFrom: smtpFrom.trim(),
        smtpPass: '',
        globalRequestHeaders: cleanHeaders,
      })
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? t('saveError')
        : t('saveError')
      showSnack(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTerminology = async () => {
    setSavingTerms(true)
    try {
      await api.patch('/settings', {
        termServer: termServer.trim() || null,
        termTool: termTool.trim() || null,
        termResource: termResource.trim() || null,
        termPrompt: termPrompt.trim() || null,
        termChain: termChain.trim() || null,
        termSecret: termSecret.trim() || null,
      })
      reloadTerminology()
      showSnack(t('terminology.saveSuccess'), 'success')
    } catch {
      showSnack(t('terminology.saveError'), 'error')
    } finally {
      setSavingTerms(false)
    }
  }

  if (loading || authLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="40vh">
      <CircularProgress />
    </Box>
  )

  if (!can(Permission.SettingsManage)) return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={12}>
      <Typography variant="h6" color="text.secondary">{t('accessRestricted')}</Typography>
      <Typography variant="body2" color="text.secondary">{t('accessRestrictedMsg')}</Typography>
    </Box>
  )

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        <Typography variant="h5" fontWeight={700} letterSpacing="-0.2px">{t('title')}</Typography>
        <HelpButton title={t('help.title')}>
          <Typography variant="body2" gutterBottom>
            {t('help.intro')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('help.sections')}
          </Typography>
          <Box component="ul" sx={{ mt: 0, mb: 1, pl: 2.5 }}>
            <Box component="li"><Typography variant="body2">{t('help.sectionServer')}</Typography></Box>
            <Box component="li"><Typography variant="body2">{t('help.sectionEmail')}</Typography></Box>
          </Box>
          <Typography variant="body2">
            {t('help.saveReminder')}
          </Typography>
        </HelpButton>
      </Box>

      {/* Server */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}><IconWorld size={18} /></Box>
          <Typography variant="subtitle1" fontWeight={700}>{t('server.title')}</Typography>
          <HelpButton title={t('server.helpTitle')}>
            <Typography variant="body2" gutterBottom>
              <strong>Public Server URL</strong> — the externally reachable address of this Arthur instance (e.g. <code>https://mcp.my-company.com</code>). This URL is used in two places:
            </Typography>
            <Box component="ul" sx={{ mt: 0, mb: 1, pl: 2.5 }}>
              <Box component="li"><Typography variant="body2"><strong>Password-reset emails:</strong> the reset link included in the email points to this URL + <code>/reset-password</code>. If the URL is wrong, users receive broken links.</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>MCP endpoint display:</strong> some UI elements construct MCP endpoint URLs using this base. Set it to the address your users will actually use from their machines.</Typography></Box>
            </Box>
            <Typography variant="body2" gutterBottom>
              <strong>Default timeout (ms)</strong> — how long Arthur waits for a response from the upstream API before cancelling the HTTP request and returning an error to the AI client. Default is 30,000 ms (30 seconds).
            </Typography>
            <Typography variant="body2">
              Increase the timeout for slow APIs (large file downloads, heavy queries). Decrease it to fail fast and free up resources. Very long timeouts can make AI clients appear unresponsive while they wait for Arthur to give up on a stalled request.
            </Typography>
          </HelpButton>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              size="small" fullWidth
              label={t('server.urlLabel')}
              placeholder={t('server.urlPlaceholder')}
              helperText={t('server.urlHelper')}
              value={serverBaseUrl}
              onChange={(e) => setServerBaseUrl(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><IconWorld size={16} /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              size="small" fullWidth type="number"
              label={t('server.timeoutLabel')}
              helperText={t('server.timeoutHelper')}
              value={defaultTimeoutMs}
              onChange={(e) => setDefaultTimeoutMs(Number(e.target.value))}
              InputProps={{ startAdornment: <InputAdornment position="start"><IconClock size={16} /></InputAdornment> }}
            />
          </Grid>
        </Grid>
      </Paper>

      <GlobalRequestHeadersPanel
        globalHeaders={globalHeaders}
        onAdd={addGlobalHeader}
        onRemove={removeGlobalHeader}
        onChange={setGlobalHeader}
      />

      {/* SMTP */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}><IconMail size={18} /></Box>
          <Typography variant="subtitle1" fontWeight={700}>{t('smtp.title')}</Typography>
          <HelpButton title={t('smtp.helpTitle')}>
            <Typography variant="body2" gutterBottom>
              SMTP (Simple Mail Transfer Protocol) credentials used by Arthur to send transactional emails — currently only the password-reset flow. Without valid SMTP settings the "Forgot password" feature silently fails and users will not receive reset links.
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Field guide:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 0, mb: 1, pl: 2.5 }}>
              <Box component="li"><Typography variant="body2"><strong>SMTP Host:</strong> your email provider's outbound mail server (e.g. <code>smtp.gmail.com</code>, <code>smtp.sendgrid.net</code>).</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>Port:</strong> typically <code>587</code> for STARTTLS or <code>465</code> for SSL/TLS. Port 25 is usually blocked by cloud providers.</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>SMTP User:</strong> the username or email address used to authenticate with the SMTP server.</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>SMTP Password:</strong> the account's password. For Gmail, use an <em>App Password</em> instead of your Google account password (two-factor accounts require this).</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>From email:</strong> the sender address that appears in the user's inbox (e.g. <code>noreply@company.com</code>). Must be authorised to send from your SMTP account.</Typography></Box>
            </Box>
            <Typography variant="body2">
              If you already set a password previously, leave the password field blank to keep it unchanged. Enter a new value only when you need to rotate credentials.
            </Typography>
          </HelpButton>
        </Box>
        {data?.smtpPassSet && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('smtp.passwordAlreadySet')}
          </Typography>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField size="small" fullWidth label={t('smtp.hostLabel')} placeholder="smtp.gmail.com" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              size="small" fullWidth type="number" label={t('smtp.portLabel')}
              value={smtpPort}
              onChange={(e) => setSmtpPort(Number(e.target.value))}
              error={smtpPortError}
              helperText={smtpPortError ? t('smtp.portError') : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField size="small" fullWidth label={t('smtp.userLabel')} value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small" fullWidth type="password"
              label={data?.smtpPassSet ? t('smtp.passwordChangeLabel') : t('smtp.passwordLabel')}
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              size="small" fullWidth
              label={t('smtp.fromLabel')}
              placeholder={t('smtp.fromPlaceholder')}
              value={smtpFrom}
              onChange={(e) => setSmtpFrom(e.target.value)}
              error={smtpFromError}
              helperText={smtpFromError ? t('smtp.fromError') : ''}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="flex-end" mt={1} mb={3}>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={saving || !isDirty}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <IconDeviceFloppy size={18} />}
        >
          {saving ? t('saving') : t('saveSettings')}
        </Button>
      </Box>

      <TerminologyPanel
        termServer={termServer}
        termTool={termTool}
        termResource={termResource}
        termPrompt={termPrompt}
        termChain={termChain}
        termSecret={termSecret}
        savingTerms={savingTerms}
        onTermServerChange={setTermServer}
        onTermToolChange={setTermTool}
        onTermResourceChange={setTermResource}
        onTermPromptChange={setTermPrompt}
        onTermChainChange={setTermChain}
        onTermSecretChange={setTermSecret}
        onSave={handleSaveTerminology}
      />

      <AppSnackbar
        open={snackOpen}
        message={snackMsg}
        severity={snackSeverity}
        onClose={() => setSnackOpen(false)}
      />
    </Box>
  )
}
