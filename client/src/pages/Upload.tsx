import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import api from '../api'

type Phase = 'idle' | 'uploading' | 'success' | 'error'

interface UploadResult {
  _id: string
  name: string
  tools: { name: string }[]
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [baseUrl, setBaseUrl] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const accept = (f: File) => {
    const name = f.name.toLowerCase()
    if (!name.endsWith('.yaml') && !name.endsWith('.yml') && !name.endsWith('.json')) {
      setErrorMsg('Formato inválido. Use .yaml, .yml ou .json')
      setPhase('error')
      return
    }
    setFile(f)
    setPhase('idle')
    setErrorMsg('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) accept(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setPhase('uploading')
    setErrorMsg('')
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const params = baseUrl ? { baseUrl } : {}
      const { data } = await api.post<UploadResult>('/swagger/upload', form, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      setPhase('success')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao processar o arquivo.'
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg)
      setPhase('error')
    }
  }

  return (
    <Box p={3} maxWidth={640} mx="auto">
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Upload de API
      </Typography>

      {/* Drop zone */}
      <Paper
        variant="outlined"
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          p: 6,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          bgcolor: dragging ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".yaml,.yml,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) accept(f)
            e.target.value = ''
          }}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        {file ? (
          <Typography fontWeight="bold">{file.name}</Typography>
        ) : (
          <>
            <Typography>Arraste seu arquivo Swagger / OpenAPI aqui</Typography>
            <Typography variant="body2" color="text.secondary">
              ou clique para selecionar (.yaml, .yml, .json)
            </Typography>
          </>
        )}
      </Paper>

      {/* Optional base URL */}
      <TextField
        label="Base URL (opcional)"
        placeholder="https://api.exemplo.com"
        fullWidth
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        sx={{ mt: 2 }}
        helperText="Sobrepõe a URL base do spec"
      />

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ mt: 2 }}
        disabled={!file || phase === 'uploading'}
        onClick={handleSubmit}
        startIcon={phase === 'uploading' ? <CircularProgress size={18} color="inherit" /> : undefined}
      >
        {phase === 'uploading' ? 'Processando…' : 'Enviar'}
      </Button>

      {phase === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {phase === 'success' && result && (
        <Alert
          severity="success"
          sx={{ mt: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(`/projects/${result._id}`)}
            >
              Ver projeto
            </Button>
          }
        >
          <strong>{result.name}</strong> importado com sucesso —{' '}
          {result.tools.length} ferramenta{result.tools.length !== 1 ? 's' : ''} gerada
          {result.tools.length !== 1 ? 's' : ''}.
        </Alert>
      )}
    </Box>
  )
}
