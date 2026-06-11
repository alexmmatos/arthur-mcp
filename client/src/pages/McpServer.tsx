import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import api from '../api'

interface McpInfo {
  name: string
  version: string
  description?: string
  tools: { name: string; description?: string }[]
  resources: { uri: string; name: string; description?: string }[]
}

export default function McpServer() {
  const [info, setInfo] = useState<McpInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<McpInfo>('/mcp-docs/json')
      .then((r) => setInfo(r.data))
      .catch(() => setError('Não foi possível carregar as informações do servidor MCP.'))
      .finally(() => setLoading(false))
  }, [])

  const mcpUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port || 3000}/mcp`

  const copyUrl = () => navigator.clipboard.writeText(mcpUrl)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3} maxWidth={900}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Servidor MCP
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Connection info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Conexão
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Use esta URL para conectar clientes MCP (Claude Desktop, Cursor, etc.)
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            px: 2,
            py: 1,
            mt: 1,
          }}
        >
          <Typography fontFamily="monospace" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
            {mcpUrl}
          </Typography>
          <Button size="small" onClick={copyUrl} startIcon={<ContentCopyIcon />}>
            Copiar
          </Button>
        </Box>
      </Paper>

      {info && (
        <>
          {/* Server info */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informações
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">Nome</Typography>
                <Typography fontWeight="bold">{info.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Versão</Typography>
                <Typography fontWeight="bold">{info.version}</Typography>
              </Box>
              {info.description && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Descrição</Typography>
                  <Typography>{info.description}</Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Tools */}
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Ferramentas registradas
              </Typography>
              <Chip label={info.tools.length} color="primary" size="small" />
            </Box>
            {info.tools.length === 0 ? (
              <Typography color="text.secondary">Nenhuma ferramenta registrada.</Typography>
            ) : (
              info.tools.map((t, i) => (
                <Box key={t.name}>
                  {i > 0 && <Divider sx={{ my: 1.5 }} />}
                  <Typography fontWeight="bold" fontFamily="monospace">{t.name}</Typography>
                  {t.description && (
                    <Typography variant="body2" color="text.secondary">{t.description}</Typography>
                  )}
                </Box>
              ))
            )}
          </Paper>

          {/* Resources */}
          {info.resources.length > 0 && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Recursos</Typography>
                <Chip label={info.resources.length} color="secondary" size="small" />
              </Box>
              {info.resources.map((r, i) => (
                <Box key={r.uri}>
                  {i > 0 && <Divider sx={{ my: 1.5 }} />}
                  <Typography fontWeight="bold">{r.name}</Typography>
                  <Typography variant="body2" fontFamily="monospace" color="text.secondary">{r.uri}</Typography>
                  {r.description && (
                    <Typography variant="body2" color="text.secondary">{r.description}</Typography>
                  )}
                </Box>
              ))}
            </Paper>
          )}
        </>
      )}
    </Box>
  )
}
