import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, Permission } from '../context/AuthContext'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  IconArrowLeft,
  IconArrowRight,
  IconPlus,
  IconCloudUpload,
  IconFile,
  IconX,
  IconTrash,
  IconKey,
  IconEye,
  IconEyeOff,
  IconTool,
  IconSparkles,
  IconPackage,
  IconTag,
  IconCircleCheck,
} from '@tabler/icons-react'
import api from '../api'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Server details', 'Import API spec', 'Tools overview', 'API Authentication']

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

const METHOD_COLOR: Record<string, string> = {
  GET: '#61affe', POST: '#49cc90', PUT: '#fca130', PATCH: '#50e3c2', DELETE: '#f93e3e',
}

type AuthType = 'none' | 'bearer' | 'api-key' | 'basic' | 'oauth2-client' | 'custom'

const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  none: 'None (public API)',
  bearer: 'Bearer Token',
  'api-key': 'API Key',
  basic: 'Basic Auth (username/password)',
  'oauth2-client': 'OAuth2 Client Credentials',
  custom: 'Custom headers',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalTool {
  id: string
  name: string
  description?: string
  method: string
  path: string
  enabled: boolean
  fromSpec: boolean
}

interface SpecMeta {
  name: string
  version?: string
  description?: string
  resolvedBaseUrl: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(u: string) {
  try { new URL(u); return true } catch { return false }
}

function uid() { return Math.random().toString(36).slice(2) }

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewServer() {
  const navigate = useNavigate()
  const { can, loading: authLoading } = useAuth()
  const [activeStep, setActiveStep] = useState(0)

  // Step 0 — Server details
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Step 1 — Import
  const [importTab, setImportTab] = useState(0) // 0 = OpenAPI, 1 = Postman
  const [file, setFile] = useState<File | null>(null)
  const [postmanFile, setPostmanFile] = useState<File | null>(null)
  const [fetchedForFile, setFetchedForFile] = useState<File | null>(null)
  const [baseUrl, setBaseUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const postmanInputRef = useRef<HTMLInputElement>(null)

  // Step 2 — Tools overview
  const [specMeta, setSpecMeta] = useState<SpecMeta | null>(null)
  const [localTools, setLocalTools] = useState<LocalTool[]>([])
  const [deletedSpecTools, setDeletedSpecTools] = useState<string[]>([])
  const [previewing, setPreviewing] = useState(false)

  // Step 3 — API Authentication
  const [authType, setAuthType] = useState<AuthType>('none')
  const [showSecrets, setShowSecrets] = useState(false)
  const [token, setToken] = useState('')
  const [keyName, setKeyName] = useState('')
  const [keyValue, setKeyValue] = useState('')
  const [keyIn, setKeyIn] = useState<'header' | 'query'>('header')
  const [basicUser, setBasicUser] = useState('')
  const [basicPass, setBasicPass] = useState('')
  const [oauthTokenUrl, setOauthTokenUrl] = useState('')
  const [oauthClientId, setOauthClientId] = useState('')
  const [oauthClientSecret, setOauthClientSecret] = useState('')
  const [oauthScope, setOauthScope] = useState('')
  const [customHeaders, setCustomHeaders] = useState<{ name: string; value: string }[]>([{ name: '', value: '' }])

  // Submit
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // ── Validation ────────────────────────────────────────────────────────────

  const step0Valid = name.trim().length > 0

  const activeFile = importTab === 0 ? file : postmanFile
  const step1Valid = importTab === 0
    ? (file ? (baseUrl.trim() === '' || isValidUrl(baseUrl.trim())) : (baseUrl.trim().length > 0 && isValidUrl(baseUrl.trim())))
    : !!postmanFile

  const canNext = () => {
    if (activeStep === 0) return step0Valid
    if (activeStep === 1) return step1Valid
    return true
  }

  const isLastStep = activeStep === STEPS.length - 1

  // ── Tags ─────────────────────────────────────────────────────────────────

  const addTag = (raw: string) => {
    const trimmed = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (trimmed && !tags.includes(trimmed)) setTags((t) => [...t, trimmed])
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags((t) => t.slice(0, -1))
  }

  // ── File handling ─────────────────────────────────────────────────────────

  const clearSpecState = () => {
    setSpecMeta(null); setLocalTools([]); setDeletedSpecTools([]); setFetchedForFile(null)
  }

  const acceptOpenApiFile = (f: File) => {
    const n = f.name.toLowerCase()
    if (!n.endsWith('.yaml') && !n.endsWith('.yml') && !n.endsWith('.json')) {
      setError('Unsupported format. Use .yaml, .yml or .json'); return
    }
    if (f !== fetchedForFile) clearSpecState()
    setFile(f); setError('')
  }

  const acceptPostmanFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.json')) { setError('Postman collections must be .json'); return }
    setPostmanFile(f); clearSpecState(); setError('')
  }

  // ── Auto-discover ─────────────────────────────────────────────────────────

  const handleDiscover = async () => {
    if (!isValidUrl(baseUrl.trim())) return
    setDiscovering(true); setError('')
    try {
      const { data } = await api.post<SpecMeta & { tools?: Array<{ name: string; description?: string; method: string; path: string }> }>(
        '/swagger/discover', { baseUrl: baseUrl.trim() }
      )
      if (data.tools?.length) {
        setSpecMeta({ name: data.name, version: data.version, description: data.description, resolvedBaseUrl: data.resolvedBaseUrl ?? baseUrl.trim() })
        setLocalTools(data.tools.map((t) => ({ id: uid(), name: t.name, description: t.description, method: t.method, path: t.path, enabled: true, fromSpec: true })))
        setFetchedForFile(null)
      } else {
        setError('No spec found at this URL. Try uploading the file manually.')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not discover spec from this URL.')
    } finally {
      setDiscovering(false)
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    if (activeStep === 1) {
      if (importTab === 0 && file && file !== fetchedForFile) {
        setPreviewing(true); setError('')
        try {
          const form = new FormData()
          form.append('file', file)
          const params = baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}
          const { data } = await api.post<SpecMeta & { totalTools: number; tools: Array<{ name: string; description?: string; method: string; path: string }> }>(
            '/swagger/preview', form, { params, headers: { 'Content-Type': 'multipart/form-data' } }
          )
          setSpecMeta({ name: data.name, version: data.version, description: data.description, resolvedBaseUrl: data.resolvedBaseUrl })
          setLocalTools(data.tools.map((t) => ({ id: uid(), name: t.name, description: t.description, method: t.method, path: t.path, enabled: true, fromSpec: true })))
          setDeletedSpecTools([])
          setFetchedForFile(file)
        } catch (err: any) {
          const msg = err?.response?.data?.message ?? 'Error parsing spec.'
          setError(Array.isArray(msg) ? msg.join(', ') : msg); return
        } finally {
          setPreviewing(false)
        }
      } else if (importTab === 0 && !file && fetchedForFile !== null) {
        setLocalTools((prev) => prev.filter((t) => !t.fromSpec))
        setSpecMeta(null); setDeletedSpecTools([]); setFetchedForFile(null)
      } else if (importTab === 1 && postmanFile && postmanFile !== fetchedForFile) {
        setPreviewing(true); setError('')
        try {
          const form = new FormData()
          form.append('file', postmanFile)
          const params = baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}
          const { data } = await api.post<SpecMeta & { tools?: Array<{ name: string; description?: string; method: string; path: string }> }>(
            '/swagger/parse-postman', form, { params, headers: { 'Content-Type': 'multipart/form-data' } }
          )
          setSpecMeta({ name: data.name ?? 'Postman Collection', version: data.version, description: data.description, resolvedBaseUrl: data.resolvedBaseUrl ?? baseUrl.trim() })
          setLocalTools((data.tools ?? []).map((t) => ({ id: uid(), name: t.name, description: t.description, method: t.method, path: t.path, enabled: true, fromSpec: true })))
          setDeletedSpecTools([])
          setFetchedForFile(postmanFile)
        } catch (err: any) {
          const msg = err?.response?.data?.message ?? 'Error parsing Postman collection.'
          setError(Array.isArray(msg) ? msg.join(', ') : msg); return
        } finally {
          setPreviewing(false)
        }
      }
    }
    setActiveStep((s) => s + 1)
  }

  // ── Create project ────────────────────────────────────────────────────────

  const buildAuth = () => {
    switch (authType) {
      case 'bearer': return { type: 'bearer', token }
      case 'api-key': return { type: 'api-key', name: keyName, value: keyValue, in: keyIn }
      case 'basic': return { type: 'basic', username: basicUser, password: basicPass }
      case 'oauth2-client': return { type: 'oauth2-client', tokenUrl: oauthTokenUrl, clientId: oauthClientId, clientSecret: oauthClientSecret, scope: oauthScope || undefined }
      case 'custom': return { type: 'custom', headers: customHeaders.filter((h) => h.name.trim()) }
      default: return { type: 'none' }
    }
  }

  const handleCreate = async () => {
    setError(''); setCreating(true)
    try {
      let projectId: string

      if (importTab === 1 && postmanFile) {
        // Postman import — backend creates server + tools
        const form = new FormData()
        form.append('file', postmanFile)
        const params = baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}
        const { data } = await api.post<{ _id: string }>('/swagger/import-postman', form, { params, headers: { 'Content-Type': 'multipart/form-data' } })
        projectId = data._id
      } else if (importTab === 0 && file) {
        // OpenAPI spec upload
        const form = new FormData()
        form.append('file', file)
        const params = baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}
        const { data } = await api.post<{ _id: string; baseUrl: string }>('/swagger/upload', form, { params, headers: { 'Content-Type': 'multipart/form-data' } })
        projectId = data._id
      } else {
        // Empty server
        const { data } = await api.post<{ _id: string; baseUrl: string }>('/swagger/servers', {
          name: name.trim(),
          baseUrl: baseUrl.trim(),
          description: description.trim() || undefined,
        })
        projectId = data._id
      }

      // Apply auth
      if (authType !== 'none') {
        await api.patch(`/swagger/servers/${projectId}/auth`, buildAuth())
      }

      // Apply tags
      if (tags.length > 0) {
        await api.patch(`/swagger/servers/${projectId}/tags`, { tags })
      }

      navigate(`/servers/${projectId}`)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error creating server.'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
      setCreating(false)
    }
  }

  // ── Secret input helper ───────────────────────────────────────────────────

  const secretInput = (value: string, onChange: (v: string) => void, label: string) => (
    <TextField size="small" fullWidth label={label}
      type={showSecrets ? 'text' : 'password'} value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setShowSecrets((s) => !s)} edge="end">
              {showSecrets ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )

  // ── Render ────────────────────────────────────────────────────────────────

  if (!authLoading && !can(Permission.ServersCreate)) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={12}>
        <Typography variant="h6" color="text.secondary">Access restricted</Typography>
        <Typography variant="body2" color="text.secondary">You don't have permission to create servers.</Typography>
      </Box>
    )
  }

  return (
    <Box py={3} maxWidth={700} mx="auto">
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <Button size="small" startIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/')} sx={{ mr: 0.5 }}>
          Servers
        </Button>
        <Typography variant="h5" fontWeight={700}>New server</Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label, i) => (
          <Step key={label} completed={activeStep > i}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ── Step 0: Server details ─────────────────────────────────────── */}
      {activeStep === 0 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Server details</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Give your server a name so you can identify it later. Everything else can be configured after creation.
          </Typography>
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField label="Server name" required fullWidth autoFocus
              placeholder="e.g. Stripe Payments, Internal CRM"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && step0Valid && handleNext()}
              helperText="A short name that identifies this API integration"
            />
            <TextField label="Description" fullWidth multiline minRows={3} maxRows={8}
              placeholder="What does this server do? What API does it connect to?"
              value={description} onChange={(e) => setDescription(e.target.value)}
              helperText="Optional — helps team members understand the purpose of this server"
            />
            {/* Tags */}
            <Box>
              <TextField
                size="small" fullWidth label="Tags" placeholder="Press Enter or comma to add…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
                helperText="Optional — used to filter and organize servers"
                InputProps={{
                  startAdornment: tags.length > 0 ? (
                    <InputAdornment position="start" sx={{ flexWrap: 'wrap', gap: 0.5, py: 0.5, maxWidth: '60%' }}>
                      {tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" icon={<IconTag size={12} />}
                          onDelete={() => setTags((t) => t.filter((x) => x !== tag))}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ))}
                    </InputAdornment>
                  ) : undefined,
                }}
              />
            </Box>
          </Box>
        </Paper>
      )}

      {/* ── Step 1: Import API spec ─────────────────────────────────────── */}
      {activeStep === 1 && (
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Tabs value={importTab} onChange={(_, v) => { setImportTab(v); setError('') }}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
              <Tab label="OpenAPI / Swagger" icon={<IconCloudUpload size={15} />} iconPosition="start"
                sx={{ minHeight: 44, fontSize: '0.82rem', gap: 0.5 }} />
              <Tab label="Postman collection" icon={<IconPackage size={15} />} iconPosition="start"
                sx={{ minHeight: 44, fontSize: '0.82rem', gap: 0.5 }} />
            </Tabs>

            {/* OpenAPI tab */}
            {importTab === 0 && (
              <Box p={2.5}>
                <Box
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) acceptOpenApiFile(f) }}
                  onClick={() => !file && fileInputRef.current?.click()}
                  sx={{
                    p: 4, textAlign: 'center', cursor: file ? 'default' : 'pointer', borderRadius: 1,
                    border: '2px dashed', borderColor: dragging ? 'primary.main' : file ? 'success.main' : 'divider',
                    bgcolor: dragging ? 'primary.light' : file ? 'rgba(73,204,144,0.08)' : 'action.hover',
                    transition: 'all 0.18s',
                    '&:hover': file ? {} : { borderColor: 'primary.light' },
                  }}
                >
                  <input ref={fileInputRef} type="file" accept=".yaml,.yml,.json" hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptOpenApiFile(f); e.target.value = '' }} />
                  {file ? (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <IconFile size={36} color="var(--mui-palette-success-main)" />
                      <Typography fontWeight={700} color="success.main">{file.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Tools will be generated automatically from this spec</Typography>
                      <Button size="small" startIcon={<IconX size={14} />}
                        onClick={(e) => { e.stopPropagation(); setFile(null); clearSpecState(); setError('') }} sx={{ mt: 0.5 }}>
                        Remove file
                      </Button>
                    </Box>
                  ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                      <IconCloudUpload size={40} style={{ opacity: 0.4 }} />
                      <Typography fontWeight={500} mt={0.5}>Drag your OpenAPI / Swagger spec here</Typography>
                      <Typography variant="body2" color="text.secondary">or click to browse · .yaml · .yml · .json</Typography>
                      <Typography variant="caption" color="text.disabled" mt={1} display="block">
                        Optional — skip to start with an empty server and add tools manually
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Postman tab */}
            {importTab === 1 && (
              <Box p={2.5}>
                <Box
                  onClick={() => !postmanFile && postmanInputRef.current?.click()}
                  sx={{
                    p: 4, textAlign: 'center', cursor: postmanFile ? 'default' : 'pointer', borderRadius: 1,
                    border: '2px dashed', borderColor: postmanFile ? 'success.main' : 'divider',
                    bgcolor: postmanFile ? 'rgba(73,204,144,0.08)' : 'action.hover',
                    transition: 'all 0.18s',
                    '&:hover': postmanFile ? {} : { borderColor: 'primary.light' },
                  }}
                >
                  <input ref={postmanInputRef} type="file" accept=".json" hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptPostmanFile(f); e.target.value = '' }} />
                  {postmanFile ? (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <IconFile size={36} color="var(--mui-palette-success-main)" />
                      <Typography fontWeight={700} color="success.main">{postmanFile.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Postman collection will be imported as MCP tools</Typography>
                      <Button size="small" startIcon={<IconX size={14} />}
                        onClick={(e) => { e.stopPropagation(); setPostmanFile(null); clearSpecState(); setError('') }} sx={{ mt: 0.5 }}>
                        Remove file
                      </Button>
                    </Box>
                  ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                      <IconPackage size={40} style={{ opacity: 0.4 }} />
                      <Typography fontWeight={500} mt={0.5}>Drag your Postman Collection v2 here</Typography>
                      <Typography variant="body2" color="text.secondary">or click to browse · .json</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Base URL */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
              {importTab === 0 && file ? 'Base URL override' : 'API Base URL'}
              {importTab === 0 && !file && <Typography component="span" color="error.main"> *</Typography>}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              {importTab === 0 && file
                ? 'Leave blank to use the server URL declared inside the spec. Fill in to point to a different environment.'
                : importTab === 1
                  ? 'Override the base URL from the Postman collection. Leave blank to use the URL defined in the collection.'
                  : 'The root address of the external API. All tool endpoints will be appended to this URL.'}
            </Typography>
            <Box display="flex" gap={1}>
              <TextField fullWidth size="small" required={importTab === 0 && !file} placeholder="https://api.example.com"
                value={baseUrl}
                onChange={(e) => { setBaseUrl(e.target.value); setError('') }}
                error={baseUrl.trim().length > 0 && !isValidUrl(baseUrl.trim())}
                helperText={baseUrl.trim().length > 0 && !isValidUrl(baseUrl.trim())
                  ? 'Invalid URL — include the protocol (e.g. https://api.example.com)' : ''}
              />
              {importTab === 0 && !file && (
                <Tooltip title="Try to auto-discover the OpenAPI spec from this URL">
                  <span>
                    <Button variant="outlined" size="small" startIcon={discovering ? <CircularProgress size={13} color="inherit" /> : <IconSparkles size={15} />}
                      onClick={handleDiscover}
                      disabled={!isValidUrl(baseUrl.trim()) || discovering}
                      sx={{ whiteSpace: 'nowrap', flexShrink: 0, height: 40 }}>
                      {discovering ? 'Discovering…' : 'Auto-discover'}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Box>
            {localTools.length > 0 && !activeFile && (
              <Alert severity="success" icon={<IconCircleCheck size={16} />} sx={{ mt: 1.5, py: 0.5, fontSize: '0.82rem' }}>
                Discovered <strong>{localTools.length} tools</strong> from the spec at this URL.
              </Alert>
            )}
          </Paper>

          {importTab === 0 && file && (
            <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
              When importing a spec, the <strong>server name</strong> is taken from the spec's <code>info.title</code> field. You can rename it from the server detail page.
            </Alert>
          )}
        </Box>
      )}

      {/* ── Step 2: Tools overview ──────────────────────────────────────── */}
      {activeStep === 2 && (
        <Box display="flex" flexDirection="column" gap={2}>
          {specMeta ? (
            <>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                  <IconTool size={18} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <Box flexGrow={1} minWidth={0}>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="subtitle2" fontWeight={700}>{specMeta.name}</Typography>
                      {specMeta.version && (
                        <Chip label={`v${specMeta.version}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                      )}
                      <Chip label={`${localTools.length} tool${localTools.length !== 1 ? 's' : ''}`} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 20 }} />
                    </Box>
                    {specMeta.description && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>{specMeta.description}</Typography>
                    )}
                  </Box>
                </Box>
              </Paper>

              {localTools.length > 0 && (
                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  {localTools.slice(0, 8).map((t, i) => (
                    <Box key={t.id} display="flex" alignItems="center" gap={1.5} px={2} py={1}
                      sx={{ borderBottom: i < Math.min(localTools.length, 8) - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Box sx={{
                        px: 0.75, py: 0.2, borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700,
                        fontSize: '0.65rem', color: METHOD_COLOR[t.method] ?? '#888',
                        bgcolor: 'action.selected', minWidth: 44, textAlign: 'center', flexShrink: 0,
                      }}>
                        {t.method}
                      </Box>
                      <Typography fontSize="0.82rem" fontWeight={600} noWrap flexGrow={1}>{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace" noWrap flexShrink={0}>{t.path}</Typography>
                    </Box>
                  ))}
                  {localTools.length > 8 && (
                    <Box px={2} py={1} sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary">
                        +{localTools.length - 8} more tools — all will be created and available to configure after creation
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <IconTool size={40} style={{ opacity: 0.25, marginBottom: 8 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>No spec imported</Typography>
              <Typography variant="body2" color="text.disabled">
                The server will be created empty. You can add tools manually from the server detail page.
              </Typography>
            </Paper>
          )}

          <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
            Tool parameters, descriptions, output schemas, and test configurations are all editable from the server detail page after creation.
          </Alert>
        </Box>
      )}

      {/* ── Step 3: API Authentication ──────────────────────────────────── */}
      {activeStep === 3 && (
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <IconKey size={16} style={{ opacity: authType !== 'none' ? 1 : 0.4 }} />
              <Typography variant="subtitle2" fontWeight={700}>API Authentication</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Credentials attached to every outgoing HTTP request when calling your API. The AI never sees these — they are injected automatically.
            </Typography>

            <FormControl size="small" fullWidth sx={{ mb: 3 }}>
              <InputLabel>Authentication type</InputLabel>
              <Select value={authType} label="Authentication type" onChange={(e) => setAuthType(e.target.value as AuthType)}>
                {(Object.keys(AUTH_TYPE_LABELS) as AuthType[]).map((t) => (
                  <MenuItem key={t} value={t}>{AUTH_TYPE_LABELS[t]}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {authType === 'none' && (
              <Typography variant="body2" color="text.secondary">No credentials will be attached. Use for public APIs.</Typography>
            )}

            {authType === 'bearer' && (
              <Box display="flex" flexDirection="column" gap={1.5}>
                {secretInput(token, setToken, 'Bearer Token')}
                <Typography variant="caption" color="text.secondary">Sent as: <code>Authorization: Bearer &lt;token&gt;</code></Typography>
              </Box>
            )}

            {authType === 'api-key' && (
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={5}>
                    <TextField size="small" fullWidth label="Parameter name" placeholder="X-Api-Key" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={7}>{secretInput(keyValue, setKeyValue, 'Value')}</Grid>
                </Grid>
                <FormControl size="small" fullWidth>
                  <InputLabel>Send as</InputLabel>
                  <Select value={keyIn} label="Send as" onChange={(e) => setKeyIn(e.target.value as 'header' | 'query')}>
                    <MenuItem value="header">Header HTTP</MenuItem>
                    <MenuItem value="query">Query param (?{keyName || 'key'}=…)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary">
                  {keyIn === 'header' ? `Sent as: ${keyName || '<name>'}: <value>` : `Added to URL: ?${keyName || '<name>'}=<value>`}
                </Typography>
              </Box>
            )}

            {authType === 'basic' && (
              <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField size="small" fullWidth label="Username" value={basicUser} onChange={(e) => setBasicUser(e.target.value)} />
                {secretInput(basicPass, setBasicPass, 'Password')}
                <Typography variant="caption" color="text.secondary">Sent as: <code>Authorization: Basic &lt;base64(username:password)&gt;</code></Typography>
              </Box>
            )}

            {authType === 'oauth2-client' && (
              <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField size="small" fullWidth label="Token URL" placeholder="https://auth.example.com/oauth/token"
                  value={oauthTokenUrl} onChange={(e) => setOauthTokenUrl(e.target.value)} />
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Client ID" value={oauthClientId} onChange={(e) => setOauthClientId(e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}>{secretInput(oauthClientSecret, setOauthClientSecret, 'Client Secret')}</Grid>
                </Grid>
                <TextField size="small" fullWidth label="Scope (optional)" placeholder="read write" value={oauthScope} onChange={(e) => setOauthScope(e.target.value)} />
                <Typography variant="caption" color="text.secondary">Uses <strong>client_credentials</strong> flow. Token fetched and renewed automatically.</Typography>
              </Box>
            )}

            {authType === 'custom' && (
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="caption" color="text.secondary" mb={0.5}>
                  Add any HTTP headers to every request (e.g. <code>X-Tenant-Id</code>, <code>X-Auth-Token</code>).
                </Typography>
                {customHeaders.map((h, i) => (
                  <Box key={i} display="flex" gap={1} alignItems="center">
                    <TextField size="small" label="Header" placeholder="X-Custom-Header" sx={{ flex: 1 }}
                      value={h.name} onChange={(e) => setCustomHeaders(customHeaders.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                    <TextField size="small" label="Value" sx={{ flex: 2 }}
                      type={showSecrets ? 'text' : 'password'}
                      value={h.value} onChange={(e) => setCustomHeaders(customHeaders.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                      InputProps={{
                        endAdornment: i === 0 ? (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowSecrets((s) => !s)} edge="end">
                              {showSecrets ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            </IconButton>
                          </InputAdornment>
                        ) : undefined,
                      }}
                    />
                    <Tooltip title="Remove header">
                      <span>
                        <IconButton size="small" color="error" onClick={() => setCustomHeaders(customHeaders.filter((_, idx) => idx !== i))} disabled={customHeaders.length === 1}>
                          <IconTrash size={16} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                ))}
                <Button size="small" variant="outlined" startIcon={<IconPlus size={14} />}
                  onClick={() => setCustomHeaders((prev) => [...prev, { name: '', value: '' }])}
                  sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                  Add header
                </Button>
              </Box>
            )}

            {authType !== 'none' && (
              <Alert severity="warning" sx={{ mt: 2.5, py: 0.5, fontSize: '0.78rem' }}>
                Use tokens with minimum required scope. Credentials are stored in the database.
              </Alert>
            )}
          </Paper>

          <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
            <strong>MCP API keys</strong> and <strong>rate limiting</strong> are available in the server settings after creation.
          </Alert>
        </Box>
      )}

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button size="small"
          startIcon={<IconArrowLeft size={16} />}
          onClick={() => activeStep === 0 ? navigate('/') : setActiveStep((s) => s - 1)}
          disabled={creating || previewing}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {!isLastStep && (
          <Button variant="contained" size="small"
            endIcon={previewing ? undefined : <IconArrowRight size={16} />}
            startIcon={previewing ? <CircularProgress size={14} color="inherit" /> : undefined}
            onClick={handleNext} disabled={!canNext() || previewing}
          >
            {previewing ? 'Analyzing…' : 'Next'}
          </Button>
        )}

        {isLastStep && (
          <Button variant="contained" size="small"
            startIcon={creating ? <CircularProgress size={14} color="inherit" /> : <IconPlus size={16} />}
            onClick={handleCreate} disabled={creating}
          >
            {creating ? 'Creating server…' : 'Create server'}
          </Button>
        )}
      </Box>
    </Box>
  )
}
