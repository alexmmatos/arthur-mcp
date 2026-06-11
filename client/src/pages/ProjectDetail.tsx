import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import api from '../api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParameterMapping {
  toolParamName: string
  source: 'path' | 'query' | 'header' | 'body'
  originalName: string
  required: boolean
}

interface EndpointRef {
  method: string
  path: string
  baseUrl: string
  contentType?: string
  parameterMap: ParameterMapping[]
}

interface JsonSchema {
  type?: string
  properties?: Record<string, JsonSchema>
  required?: string[]
  description?: string
  enum?: unknown[]
}

interface GeneratedTool {
  name: string
  description?: string
  inputSchema: JsonSchema
  endpointRef: EndpointRef
}

interface Project {
  _id: string
  name: string
  baseUrl: string
  description?: string
  version?: string
  status: string
  tools: GeneratedTool[]
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_COLOR: Record<string, string> = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  PATCH: '#50e3c2',
  DELETE: '#f93e3e',
}

const METHOD_BG: Record<string, string> = {
  GET: '#ebf3fb',
  POST: '#e7f6ec',
  PUT: '#fef3e2',
  PATCH: '#e6f8f4',
  DELETE: '#fde9e9',
}

const SOURCE_CHIP_COLOR: Record<
  string,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
> = {
  path: 'secondary',
  query: 'primary',
  body: 'success',
  header: 'warning',
}

// ─── MCP response parser ──────────────────────────────────────────────────────
// Handles both plain JSON-RPC and SSE "data: {...}" format

function parseMcpResponse(data: unknown): any {
  if (typeof data === 'object' && data !== null) return data
  if (typeof data === 'string') {
    const match = data.match(/^data:\s*(.+)$/m)
    if (match) {
      try { return JSON.parse(match[1]) } catch { /* fall through */ }
    }
    try { return JSON.parse(data) } catch { /* fall through */ }
  }
  return {}
}

// ─── Curl snippet ─────────────────────────────────────────────────────────────

function buildCurl(tool: GeneratedTool): string {
  const { method, path, baseUrl, parameterMap } = tool.endpointRef
  const properties = tool.inputSchema.properties ?? {}

  let url = `${baseUrl}${path}`
  const pathParams = (parameterMap ?? []).filter((p) => p.source === 'path')
  pathParams.forEach((p) => {
    url = url.replace(`{${p.originalName}}`, `<${p.toolParamName}>`)
  })

  const queryParams = (parameterMap ?? []).filter((p) => p.source === 'query')
  if (queryParams.length) {
    url += '?' + queryParams.map((p) => `${p.originalName}=<${p.toolParamName}>`).join('&')
  }

  const lines: string[] = [`curl -X ${method} "${url}"`]

  if (method !== 'GET') {
    lines[0] += ' \\'
    lines.push(`  -H 'Content-Type: application/json'`)
  }

  const headerParams = (parameterMap ?? []).filter((p) => p.source === 'header')
  headerParams.forEach((p) => {
    lines[lines.length - 1] += ' \\'
    lines.push(`  -H '${p.originalName}: <${p.toolParamName}>'`)
  })

  const bodyParams = (parameterMap ?? []).filter((p) => p.source === 'body')
  if (bodyParams.length) {
    const bodyObj: Record<string, string> = {}
    bodyParams.forEach((p) => {
      bodyObj[p.toolParamName] = `<${properties[p.toolParamName]?.type ?? 'string'}>`
    })
    lines[lines.length - 1] += ' \\'
    lines.push(`  -d '${JSON.stringify(bodyObj)}'`)
  }

  return lines.join('\n')
}

// ─── Dynamic form field ────────────────────────────────────────────────────────

function FieldInput({
  name,
  schema,
  value,
  required,
  onChange,
}: {
  name: string
  schema: JsonSchema
  value: string
  required: boolean
  onChange: (v: string) => void
}) {
  const label = `${name}${required ? ' *' : ''}`

  if (schema.enum && schema.enum.length > 0) {
    return (
      <FormControl size="small" fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={(e) => onChange(String(e.target.value))}>
          {schema.enum.map((v) => (
            <MenuItem key={String(v)} value={String(v)}>
              {String(v)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  if (schema.type === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={value === 'true'}
            onChange={(e) => onChange(String(e.target.checked))}
            size="small"
          />
        }
        label={
          <Typography variant="body2" color="text.secondary">
            {label}
            {schema.description && (
              <Typography component="span" variant="caption" color="text.disabled" ml={0.5}>
                — {schema.description}
              </Typography>
            )}
          </Typography>
        }
      />
    )
  }

  const isJson = schema.type === 'object' || schema.type === 'array'

  return (
    <TextField
      size="small"
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      helperText={schema.description}
      type={schema.type === 'number' || schema.type === 'integer' ? 'number' : 'text'}
      multiline={isJson}
      minRows={isJson ? 3 : 1}
      placeholder={
        schema.type === 'object'
          ? '{"key": "value"}'
          : schema.type === 'array'
          ? '["item1", "item2"]'
          : undefined
      }
    />
  )
}

// ─── Tool accordion ───────────────────────────────────────────────────────────

function ToolAccordion({ tool, projectId }: { tool: GeneratedTool; projectId: string }) {
  const [copied, setCopied] = useState(false)
  const [tryMode, setTryMode] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [executing, setExecuting] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [responseIsError, setResponseIsError] = useState(false)

  const { method, path, parameterMap } = tool.endpointRef
  const properties = tool.inputSchema.properties ?? {}
  const requiredFields = tool.inputSchema.required ?? []
  const allParams = parameterMap ?? []
  const paramEntries = Object.entries(properties)
  const curl = buildCurl(tool)

  const handleCopy = () => {
    navigator.clipboard.writeText(curl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExecute = async () => {
    setExecuting(true)
    setResponse(null)
    setResponseIsError(false)
    try {
      const args: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(formValues)) {
        if (val === '') continue
        const schema = properties[key]
        if (schema?.type === 'number' || schema?.type === 'integer') {
          args[key] = Number(val)
        } else if (schema?.type === 'boolean') {
          args[key] = val === 'true'
        } else if (schema?.type === 'object' || schema?.type === 'array') {
          try { args[key] = JSON.parse(val) } catch { args[key] = val }
        } else {
          args[key] = val
        }
      }

      const payload = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: Date.now(),
        params: { name: tool.name, arguments: args },
      }

      const res = await api.post(`/mcp/project/${projectId}`, payload, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      })

      const rpc = parseMcpResponse(res.data)

      if (rpc?.error) {
        setResponse(JSON.stringify(rpc.error, null, 2))
        setResponseIsError(true)
        return
      }

      const content = rpc?.result?.content ?? rpc?.content
      const isError = rpc?.result?.isError ?? rpc?.isError
      if (isError) setResponseIsError(true)

      const text = content?.[0]?.text ?? JSON.stringify(rpc?.result ?? rpc, null, 2)
      try { setResponse(JSON.stringify(JSON.parse(text), null, 2)) } catch { setResponse(text) }
    } catch (err: any) {
      setResponse(err?.response?.data?.message ?? err?.message ?? 'Erro desconhecido')
      setResponseIsError(true)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Accordion
      variant="outlined"
      sx={{
        mb: '6px',
        '&:before': { display: 'none' },
        borderColor: `${METHOD_COLOR[method] ?? '#ddd'}33`,
        '&.Mui-expanded': { borderColor: `${METHOD_COLOR[method] ?? '#ddd'}88` },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: METHOD_BG[method] ?? '#fafafa',
          borderRadius: '7px 7px 0 0',
          minHeight: '52px !important',
          px: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} minWidth={0} width="100%">
          <Box
            sx={{
              px: 1.2,
              py: 0.4,
              borderRadius: '4px',
              bgcolor: METHOD_COLOR[method] ?? '#888',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              minWidth: 58,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {method}
          </Box>
          <Typography fontWeight={700} fontSize="0.875rem" noWrap>
            {tool.name}
          </Typography>
          <Typography fontFamily="monospace" fontSize="0.78rem" color="text.secondary" noWrap flexGrow={1}>
            {path}
          </Typography>
          {tool.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: 280, display: { xs: 'none', md: 'block' } }}
            >
              {tool.description}
            </Typography>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2.5 }}>
        {tool.description && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {tool.description}
          </Typography>
        )}

        {/* Parameters table */}
        {allParams.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Parâmetros
            </Typography>
            <Box sx={{ overflowX: 'auto', mb: 2 }}>
              <Table
                size="small"
                sx={{
                  minWidth: 480,
                  '& th': {
                    bgcolor: '#f8f9fa',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  },
                  '& td': { fontSize: '0.8rem' },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Em</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Obrigatório</TableCell>
                    <TableCell>Descrição</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allParams.map((p) => {
                    const schema = properties[p.toolParamName] ?? {}
                    const isReq = p.required || requiredFields.includes(p.toolParamName)
                    return (
                      <TableRow key={p.toolParamName} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Typography fontFamily="monospace" fontSize="0.8rem" fontWeight={600}>
                            {p.toolParamName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={p.source}
                            size="small"
                            color={SOURCE_CHIP_COLOR[p.source] ?? 'default'}
                            sx={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontFamily="monospace" fontSize="0.75rem" color="text.secondary">
                            {schema.type ?? 'string'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {isReq ? (
                            <Typography color="error.main" fontSize="0.72rem" fontWeight={700}>
                              sim
                            </Typography>
                          ) : (
                            <Typography color="text.disabled" fontSize="0.72rem">
                              não
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary" fontSize="0.78rem">
                            {schema.description ?? '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Try it out */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={tryMode ? 2 : 0}>
          <Typography variant="subtitle2" fontWeight={700}>
            Testar
          </Typography>
          <Button
            size="small"
            variant={tryMode ? 'outlined' : 'contained'}
            color={tryMode ? 'error' : 'primary'}
            onClick={() => { setTryMode((v) => !v); setResponse(null) }}
            sx={{ fontWeight: 600, fontSize: '0.72rem', minWidth: 80 }}
          >
            {tryMode ? 'Cancelar' : 'Testar'}
          </Button>
        </Box>

        {tryMode && (
          <Box>
            {paramEntries.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
                {paramEntries.map(([name, schema]) => (
                  <FieldInput
                    key={name}
                    name={name}
                    schema={schema}
                    value={formValues[name] ?? ''}
                    required={requiredFields.includes(name)}
                    onChange={(v) => setFormValues((prev) => ({ ...prev, [name]: v }))}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
                Esta ferramenta não possui parâmetros.
              </Typography>
            )}

            <Button
              variant="contained"
              size="small"
              startIcon={
                executing
                  ? <CircularProgress size={13} color="inherit" />
                  : <PlayArrowIcon fontSize="small" />
              }
              onClick={handleExecute}
              disabled={executing}
              sx={{ mb: response !== null ? 2 : 0, fontWeight: 600 }}
            >
              {executing ? 'Executando...' : 'Executar'}
            </Button>

            {response !== null && (
              <Box
                component="pre"
                sx={{
                  bgcolor: responseIsError ? '#fff8f8' : '#1e1e1e',
                  color: responseIsError ? '#c62828' : '#d4d4d4',
                  border: '1px solid',
                  borderColor: responseIsError ? '#ffcdd2' : 'transparent',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.78rem',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  maxHeight: 400,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  m: 0,
                }}
              >
                {response}
              </Box>
            )}
          </Box>
        )}

        {/* Curl snippet — only when not in try mode */}
        {!tryMode && (
          <Box mt={2}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Exemplo curl
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: '#1e1e1e',
                color: '#d4d4d4',
                p: 2,
                borderRadius: 1,
                fontSize: '0.78rem',
                overflowX: 'auto',
                position: 'relative',
                m: 0,
              }}
            >
              <Tooltip title={copied ? 'Copiado!' : 'Copiar'}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: copied ? 'primary.light' : '#abb2bf',
                    '&:hover': { color: '#fff' },
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
              {curl}
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

// ─── BaseUrl editor ───────────────────────────────────────────────────────────

function BaseUrlEditor({
  projectId,
  initialValue,
  onChange,
}: {
  projectId: string
  initialValue: string
  onChange: (url: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const trimmed = value.trim()
    if (!trimmed) { setError('A URL não pode ser vazia.'); return }
    try { new URL(trimmed) } catch {
      setError('URL inválida. Inclua o protocolo (ex: https://api.exemplo.com)')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.patch(`/swagger/projects/${projectId}/base-url`, { baseUrl: trimmed })
      onChange(trimmed)
      setEditing(false)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(initialValue)
    setEditing(false)
    setError('')
  }

  if (!editing) {
    return (
      <Box display="flex" alignItems="center" gap={0.5} mt={1}>
        <Typography
          variant="body2"
          fontFamily="monospace"
          fontSize="0.8rem"
          color="text.secondary"
          sx={{ wordBreak: 'break-all' }}
        >
          {initialValue}
        </Typography>
        <Tooltip title="Editar Base URL">
          <IconButton size="small" onClick={() => setEditing(true)} sx={{ ml: 0.5 }}>
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box mt={1.5}>
      <TextField
        size="small"
        fullWidth
        label="Base URL da API"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError('') }}
        error={!!error}
        helperText={error || 'URL base usada em todas as chamadas HTTP deste projeto'}
        placeholder="https://api.exemplo.com"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') handleCancel()
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Salvar">
                <span>
                  <IconButton size="small" color="primary" onClick={handleSave} disabled={saving}>
                    {saving ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Cancelar">
                <IconButton size="small" onClick={handleCancel} disabled={saving}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, textAlign: 'center', borderColor: color ? `${color}44` : 'divider' }}
    >
      <Typography variant="h4" fontWeight={700} color={color ?? 'text.primary'}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {label}
      </Typography>
    </Paper>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [baseUrl, setBaseUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api
      .get<Project>(`/swagger/projects/${id}`)
      .then((r) => { setProject(r.data); setBaseUrl(r.data.baseUrl) })
      .catch(() => setError('Projeto não encontrado.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !project) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Erro ao carregar projeto.'}</Alert>
      </Box>
    )
  }

  const methodCounts = (project.tools ?? []).reduce<Record<string, number>>((acc, t) => {
    const m = t.endpointRef?.method ?? 'UNKNOWN'
    acc[m] = (acc[m] ?? 0) + 1
    return acc
  }, {})

  return (
    <Box p={3}>
      {/* Nav */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Projetos
        </Button>
        <Button
          variant="outlined"
          startIcon={<MenuBookIcon />}
          onClick={() => navigate(`/projects/${id}/docs`)}
          sx={{ ml: 'auto' }}
        >
          Documentação MCP
        </Button>
      </Box>

      {/* Header */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box minWidth={0} flexGrow={1}>
            <Typography variant="h5" fontWeight={700}>
              {project.name}
            </Typography>
            {project.description && (
              <Typography color="text.secondary" mt={0.5} variant="body2">
                {project.description}
              </Typography>
            )}
            <BaseUrlEditor projectId={id!} initialValue={baseUrl} onChange={setBaseUrl} />
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="flex-start">
            <Chip
              label={project.status === 'active' ? 'Ativo' : 'Erro'}
              color={project.status === 'active' ? 'success' : 'error'}
            />
            {project.version && <Chip label={`v${project.version}`} variant="outlined" />}
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Ferramentas" value={project.tools.length} color="#5D87FF" />
        </Grid>
        {Object.entries(methodCounts).map(([method, count]) => (
          <Grid item xs={6} sm={3} key={method}>
            <StatCard label={method} value={count} color={METHOD_COLOR[method]} />
          </Grid>
        ))}
      </Grid>

      {/* Tools */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          Ferramentas MCP
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {project.tools.length} total
        </Typography>
      </Box>

      {project.tools.length === 0 ? (
        <Alert severity="warning">Nenhuma ferramenta foi gerada para este projeto.</Alert>
      ) : (
        project.tools.map((tool) => (
          <ToolAccordion key={tool.name} tool={tool} projectId={id!} />
        ))
      )}
    </Box>
  )
}
