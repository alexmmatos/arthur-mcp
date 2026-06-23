import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert, Box, Button, Chip, CircularProgress, Divider,
  IconButton, Paper, Step, StepContent, StepLabel, Stepper, Tooltip, Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BuildIcon from '@mui/icons-material/Build'
import LockIcon from '@mui/icons-material/Lock'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'

interface ShareInfo {
  name: string
  description?: string
  mcpUrl: string
  hasKey: boolean
  toolCount: number
}

function CopyBox({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#1e1e1e', borderRadius: 1, px: 1.5, py: 1 }}>
      <Typography fontFamily="monospace" fontSize="0.82rem" color="#e5e7eb" flexGrow={1} sx={{ wordBreak: 'break-all' }}>{value}</Typography>
      <Tooltip title={copied ? 'Copied!' : `Copy ${label}`}>
        <IconButton size="small" sx={{ color: '#9ca3af' }} onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
          {copied ? <CheckCircleIcon fontSize="small" sx={{ color: '#4ade80' }} /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [info, setInfo] = useState<ShareInfo | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    axios.get<ShareInfo>(`/api/share/${token}`)
      .then(r => setInfo(r.data))
      .catch(() => setError('This link is invalid or has expired.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="80vh"><CircularProgress /></Box>
  if (error || !info) return <Box p={4}><Alert severity="error">{error || 'Unknown error.'}</Alert></Box>

  const fullUrl = `${window.location.origin}${info.mcpUrl}`

  return (
    <Box minHeight="100vh" bgcolor="#f8fafc" py={6} px={3}>
      <Box maxWidth={620} mx="auto">
        {/* Header */}
        <Box textAlign="center" mb={5}>
          <BuildIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>{info.name}</Typography>
          {info.description && <Typography color="text.secondary" mb={1.5}>{info.description}</Typography>}
          <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
            <Chip label={`${info.toolCount} tool${info.toolCount !== 1 ? 's' : ''} available`} color="primary" />
            {info.hasKey ? <Chip icon={<LockIcon fontSize="small" />} label="Authentication required" color="warning" /> : <Chip label="No key required" variant="outlined" />}
          </Box>
        </Box>

        {/* MCP Endpoint */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={0.5}>MCP Server URL</Typography>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            This is the address you'll paste into your AI client's MCP configuration.
          </Typography>
          <CopyBox value={fullUrl} label="URL" />
          <Box mt={2} display="flex" justifyContent="center">
            <QRCodeSVG value={fullUrl} size={120} />
          </Box>
          <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={1}>
            Scan with a mobile device to transfer the URL
          </Typography>
        </Paper>

        {/* Step-by-step setup */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>How to connect</Typography>
          <Stepper orientation="vertical" nonLinear activeStep={-1}>
            {/* Claude Desktop */}
            <Step active>
              <StepLabel><Typography fontWeight={600}>Claude Desktop</Typography></StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Edit the file <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or <code>%APPDATA%\Claude\claude_desktop_config.json</code> (Windows) and add:
                </Typography>
                <CopyBox
                  label="config"
                  value={`"mcpServers": {\n  "${info.name.toLowerCase().replace(/\s+/g, '-')}": {\n    "url": "${fullUrl}"${info.hasKey ? ',\n    "headers": { "auth": "<your-api-key>" }' : ''}\n  }\n}`}
                />
                <Typography variant="caption" color="text.disabled" mt={1} display="block">Restart Claude Desktop after saving.</Typography>
              </StepContent>
            </Step>

            {/* Cursor */}
            <Step active>
              <StepLabel><Typography fontWeight={600}>Cursor</Typography></StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Open <strong>Settings → Features → MCP Servers</strong> and click <em>Add new MCP server</em>. Choose <strong>HTTP</strong> transport, paste the URL below and save.
                </Typography>
                <CopyBox value={fullUrl} label="URL" />
                {info.hasKey && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Add a custom header: <code>auth: &lt;your-api-key&gt;</code>
                  </Typography>
                )}
              </StepContent>
            </Step>

            {/* Generic */}
            <Step active>
              <StepLabel><Typography fontWeight={600}>Any MCP-compatible client</Typography></StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Point your client to this URL using <strong>Streamable HTTP</strong> transport.
                  {info.hasKey && ' Include the header '}
                  {info.hasKey && <code>auth: &lt;your-api-key&gt;</code>}
                  {info.hasKey && ' in every request.'}
                </Typography>
              </StepContent>
            </Step>
          </Stepper>

          {info.hasKey && (
            <>
              <Divider sx={{ my: 2 }} />
              <Alert severity="info" icon={<LockIcon fontSize="small" />}>
                This server requires an API key. Contact the person who shared this link to obtain your personal key.
              </Alert>
            </>
          )}
        </Paper>

        <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={3}>
          Powered by MCP Convert · This page is publicly accessible via the share link.
        </Typography>
      </Box>
    </Box>
  )
}
