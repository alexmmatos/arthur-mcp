import { useRef, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { IconDatabase, IconPlus, IconTrash } from '@tabler/icons-react'
import api from '../../../api'
import { SaveIndicator } from '../../../components/SaveIndicator'
import type { SaveStatus, TenantParam, TenantParamType } from '../types'

const TENANT_PARAM_TYPES: { value: TenantParamType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'integer', label: 'Integer' },
  { value: 'number', label: 'Number (float)' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'uuid', label: 'UUID' },
  { value: 'hash', label: 'Hash' },
]

export function TenantConfigPanel({ projectId, initialConfig, toolParamSuggestions }: {
  projectId: string
  initialConfig?: { enabled: boolean; params: TenantParam[] }
  toolParamSuggestions: string[]
}) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? false)
  const [params, setParams] = useState<TenantParam[]>(initialConfig?.params ?? [])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSave = (en: boolean, nextParams: TenantParam[]) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await api.patch(`/swagger/servers/${projectId}/tenant-config`, { enabled: en, params: nextParams })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
      }
    }, 600)
  }

  const addParam = () => {
    const next = [...params, { name: '', type: 'string' as TenantParamType, description: '', required: false }]
    setParams(next)
    scheduleSave(enabled, next)
  }

  const updateParam = (idx: number, patch: Partial<TenantParam>) => {
    const next = params.map((param, index) => index === idx ? { ...param, ...patch } : param)
    setParams(next)
    scheduleSave(enabled, next)
  }

  const removeParam = (idx: number) => {
    const next = params.filter((_, index) => index !== idx)
    setParams(next)
    scheduleSave(enabled, next)
  }

  const mcpUrl = `${window.location.origin}/api/mcp/server/${projectId}`
  const previewUrl = params.filter((param) => param.name.trim()).length > 0
    ? `${mcpUrl}?${params.filter((param) => param.name.trim()).map((param) => `${param.name}={value}`).join('&')}`
    : null

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={enabled ? 2 : 0}>
        <IconDatabase size={18} />
        <Box flexGrow={1}>
          <Typography variant="subtitle2" fontWeight={700}>Multi-tenant parameters</Typography>
          <Typography variant="caption" color="text.secondary">
            Inject query string values into tool calls that accept them.
          </Typography>
        </Box>
        <SaveIndicator status={saveStatus} />
        <FormControlLabel
          control={<Switch size="small" checked={enabled} color="primary"
            onChange={(e) => { setEnabled(e.target.checked); scheduleSave(e.target.checked, params) }} />}
          label={<Typography variant="caption">{enabled ? 'On' : 'Off'}</Typography>}
          sx={{ mr: 0 }} />
      </Box>

      {enabled && (
        <Box>
          {params.map((param, idx) => (
            <Box key={idx} display="flex" gap={1} alignItems="flex-start" mb={1.5}>
              <Autocomplete
                freeSolo
                size="small"
                sx={{ flex: 2 }}
                options={toolParamSuggestions}
                value={param.name}
                onInputChange={(_, value) => updateParam(idx, { name: value })}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Typography variant="body2" fontFamily="monospace">{option}</Typography>
                  </li>
                )}
                renderInput={(inputProps) => (
                  <TextField {...inputProps} label="Parameter name" placeholder="customerId" />
                )}
              />
              <FormControl size="small" sx={{ flex: 1.5 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={param.type}
                  onChange={(e) => updateParam(idx, { type: e.target.value as TenantParamType })}
                >
                  {TENANT_PARAM_TYPES.map((typeOption) => (
                    <MenuItem key={typeOption.value} value={typeOption.value}>{typeOption.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small" label="Description (optional)" placeholder="e.g. Customer ID"
                value={param.description ?? ''}
                onChange={(e) => updateParam(idx, { description: e.target.value })}
                sx={{ flex: 3 }}
              />
              <Tooltip title={param.required ? 'Required — rejects calls missing this param' : 'Optional — ignored if not provided'}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={param.required ?? false}
                      onChange={(e) => updateParam(idx, { required: e.target.checked })}
                      color="error"
                    />
                  }
                  label={<Typography variant="caption" color={param.required ? 'error' : 'text.secondary'}>
                    {param.required ? 'Required' : 'Optional'}
                  </Typography>}
                  sx={{ mr: 0, flexShrink: 0 }}
                />
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton size="small" color="error" onClick={() => removeParam(idx)} sx={{ mt: 0.5 }}>
                  <IconTrash size={16} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}

          <Button size="small" variant="outlined" startIcon={<IconPlus size={16} />} onClick={addParam} sx={{ mb: 2 }}>
            Add parameter
          </Button>

          {previewUrl && (
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 1.5, py: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.25} fontWeight={600}>
                Example tenant URL
              </Typography>
              <Typography variant="caption" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                {previewUrl}
              </Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
            Only tools that declare these parameters in their spec will receive the values. Others are unaffected.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}