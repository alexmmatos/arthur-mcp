import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Box,
  Button,
  Chip,
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
  IconTrash,
  IconPlus,
  IconCopy,
  IconSearch,
  IconLabel,
  IconSparkles,
} from '@tabler/icons-react'
import api from '../api'
import { useAuth, Permission } from '../context/AuthContext'
import HelpButton from '../components/HelpButton'
import ConfirmDialog from '../components/ConfirmDialog'
import AppSnackbar from '../components/AppSnackbar'

interface Project {
  _id: string
  name: string
  baseUrl: string
  description?: string
  version?: string
  status: 'active' | 'error'
  isPaused?: boolean
  tools: { name: string }[]
  tags: string[]
  createdAt: string
}

interface HealthEntry {
  projectId: string
  errorRatePct: number  // -1 = no data
  totalCalls: number
  isPaused: boolean
}

// ─── Traffic light dot ───────────────────────────────────────────────────────

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
  const { errorRatePct } = health
  const color = errorRatePct === 0 ? 'success.main' : errorRatePct < 20 ? 'warning.main' : 'error.main'
  const border = errorRatePct === 0 ? 'success.dark' : errorRatePct < 20 ? 'warning.dark' : 'error.dark'
  const label = errorRatePct === 0
    ? t('status.requestsSucceeded', { count: health.totalCalls })
    : t('status.errorRate', { rate: errorRatePct, count: health.totalCalls })
  return (
    <Tooltip title={label}>
      <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: color, flexShrink: 0, border: '1.5px solid', borderColor: border }} />
    </Tooltip>
  )
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ p, health, onDelete, onDuplicate }: {
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
        position: 'relative',
        cursor: 'pointer',
        opacity: p.isPaused ? 0.8 : 1,
        transition: 'border-color 0.15s',
        '&:hover': {
          borderColor: 'primary.main',
          '& .card-actions': { opacity: 1 },
        },
        p: 1.5,
        pr: 5,
      }}
    >
      {/* Action buttons — shown on hover */}
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
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDuplicate(p._id) }} sx={{ p: 0.5, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
              <IconCopy size={15} />
            </IconButton>
          </Tooltip>
        )}
        {can(Permission.ServersDelete) && (
          <Tooltip title={t('common:action.delete')}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(p._id) }} sx={{ p: 0.5, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
              <IconTrash size={15} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

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

      {p.tags?.length > 0 && (
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
    </Paper>
  )
}

// ─── Skeleton grid ────────────────────────────────────────────────────────────

function ProjectsSkeleton() {
  return (
    <Grid container spacing={2}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface HealthSummaryEntry {
  projectId: string
  isPaused: boolean
  errorRatePct: number
  totalCalls: number
}

export default function Servers() {
  const [projects, setProjects] = useState<Project[]>([])
  const [health, setHealth] = useState<Map<string, HealthEntry>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const navigate = useNavigate()
  const { can, loading: authLoading } = useAuth()
  const { t } = useTranslation(['servers', 'common'])

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Snackbar state
  const [snackOpen, setSnackOpen] = useState(false)
  const [snackMsg, setSnackMsg] = useState('')
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success')

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.get<Project[]>('/swagger/servers'),
      api.get<HealthSummaryEntry[]>('/dashboard/health-summary').catch(() => ({ data: [] as HealthSummaryEntry[] })),
    ])
      .then(([projectsRes, healthRes]) => {
        setProjects(projectsRes.data)
        const map = new Map<string, HealthEntry>()
        for (const h of healthRes.data) {
          map.set(h.projectId, { projectId: h.projectId, errorRatePct: h.errorRatePct, totalCalls: h.totalCalls, isPaused: h.isPaused })
        }
        setHealth(map)
      })
      .catch((err) => {
        if (err?.response?.status === 403) setError('forbidden')
        else setError(t('servers:error.loadFailed'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!can(Permission.ServersView)) { setLoading(false); return }
    load()
  }, [authLoading])

  const handleDeleteRequest = (id: string) => {
    setConfirmTarget(id)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return
    setConfirmLoading(true)
    try {
      await api.delete(`/swagger/servers/${confirmTarget}`)
      setProjects((prev) => prev.filter((p) => p._id !== confirmTarget))
      setSnackMsg(t('servers:toast.deleted'))
      setSnackSeverity('success')
      setSnackOpen(true)
    } catch {
      setSnackMsg(t('servers:toast.deleteFailed'))
      setSnackSeverity('error')
      setSnackOpen(true)
    } finally {
      setConfirmLoading(false)
      setConfirmOpen(false)
      setConfirmTarget(null)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await api.post<Project>(`/swagger/servers/${id}/duplicate`)
      setProjects((prev) => [res.data, ...prev])
      setSnackMsg(t('servers:toast.duplicated', { name: res.data.name }))
      setSnackSeverity('success')
      setSnackOpen(true)
    } catch {
      setSnackMsg(t('servers:toast.duplicateFailed'))
      setSnackSeverity('error')
      setSnackOpen(true)
    }
  }

  // All unique tags
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags ?? [])))

  // Client-side filter
  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
    const matchTag = !tagFilter || (p.tags ?? []).includes(tagFilter)
    return matchSearch && matchTag
  })

  const confirmProjectName = projects.find((p) => p._id === confirmTarget)?.name ?? 'this server'

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.2px">{t('servers:heading.title')}</Typography>
          <HelpButton title={t('servers:heading.title')}>
            <Typography variant="body2" gutterBottom>
              A <strong>server</strong> is the central concept in Arthur MCP Adapter. Each server represents one external API (e.g. your CRM, payment provider, internal microservice) adapted to the MCP protocol so that AI clients can interact with it naturally.
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>How it works end-to-end:</strong>
            </Typography>
            <Box component="ol" sx={{ mt: 0, mb: 1, pl: 2.5 }}>
              <Box component="li"><Typography variant="body2">Create a server and point it at an API's base URL.</Typography></Box>
              <Box component="li"><Typography variant="body2">Add tools — manually or by importing an OpenAPI spec. Each tool maps one API endpoint to a callable function.</Typography></Box>
              <Box component="li"><Typography variant="body2">Configure authentication so Arthur knows how to prove its identity to the API.</Typography></Box>
              <Box component="li"><Typography variant="body2">Copy the MCP endpoint URL and paste it into your AI client's server configuration.</Typography></Box>
              <Box component="li"><Typography variant="body2">The AI discovers the tools automatically and can call them in any conversation.</Typography></Box>
            </Box>
            <Typography variant="body2" gutterBottom>
              <strong>Card indicators:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 0, mb: 1, pl: 2.5 }}>
              <Box component="li"><Typography variant="body2"><strong>Coloured dot:</strong> traffic light for the last hour — green (all ok), yellow (some errors), red (high error rate), grey (no activity or paused).</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>Active / Paused chip:</strong> whether the server is accepting requests right now.</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>Tool count:</strong> how many MCP tools are registered. 0 tools means no AI can use this server yet.</Typography></Box>
              <Box component="li"><Typography variant="body2"><strong>Tags:</strong> custom labels for organisation and filtering.</Typography></Box>
            </Box>
            <Typography variant="body2">
              Click <strong>New server</strong> to open the creation wizard where you can fill in the server details and optionally import an OpenAPI/Swagger spec to auto-generate all tools.
            </Typography>
          </HelpButton>
        </Box>
        <Box display="flex" gap={1}>
          {can(Permission.TemplatesUse) && (
            <Button variant="outlined" startIcon={<IconSparkles size={18} />} onClick={() => navigate('/templates')}>
              {t('servers:action.browseTemplates')}
            </Button>
          )}
          {can(Permission.ServersCreate) && (
            <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => navigate('/servers/new')}>
              {t('servers:action.newServer')}
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={1.5} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          size="small" placeholder={t('servers:placeholder.search')}
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment> }}
        />
        {allTags.length > 0 && (
          <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
            <Typography variant="caption" color="text.secondary">{t('servers:label.tags')}</Typography>
            <Chip label={t('servers:label.all')} size="small" onClick={() => setTagFilter('')} color={tagFilter === '' ? 'primary' : 'default'} sx={{ cursor: 'pointer', height: 22 }} />
            {allTags.map((tag) => (
              <Chip key={tag} label={tag} size="small" onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                color={tagFilter === tag ? 'primary' : 'default'} sx={{ cursor: 'pointer', height: 22 }} />
            ))}
          </Box>
        )}
      </Box>

      {loading ? (
        <ProjectsSkeleton />
      ) : error === 'forbidden' || !can(Permission.ServersView) ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={12}>
          <Typography color="text.secondary" variant="h6">{t('servers:error.accessRestricted')}</Typography>
          <Typography color="text.secondary" variant="body2">{t('servers:error.forbidden')}</Typography>
        </Box>
      ) : error ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={10}>
          <Alert severity="error" sx={{ width: '100%', maxWidth: 560 }}>{error}</Alert>
          <Button variant="contained" onClick={load}>{t('common:action.reload')}</Button>
        </Box>
      ) : filtered.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={10}>
          {projects.length === 0 ? (
            <>
              <Typography color="text.secondary" variant="h6">{t('servers:empty.noServers')}</Typography>
              {can(Permission.ServersCreate) && (
                <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => navigate('/servers/new')}>
                  {t('servers:action.createFirst')}
                </Button>
              )}
            </>
          ) : (
            <Typography color="text.secondary">{t('servers:empty.noMatch')}</Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <ProjectCard p={p} health={health.get(p._id)} onDelete={handleDeleteRequest} onDuplicate={handleDuplicate} />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t('servers:confirm.deleteTitle')}
        message={t('servers:confirm.deleteMessage', { name: confirmProjectName })}
        confirmLabel={t('common:action.delete')}
        confirmColor="error"
        loading={confirmLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => { setConfirmOpen(false); setConfirmTarget(null) }}
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
