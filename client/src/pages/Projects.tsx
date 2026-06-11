import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import api from '../api'

interface Project {
  _id: string
  name: string
  baseUrl: string
  description?: string
  version?: string
  status: 'active' | 'error'
  tools: { name: string }[]
  createdAt: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    setError(null)
    api.get<Project[]>('/swagger/projects')
      .then((r) => setProjects(r.data))
      .catch((err) => {
        console.error(err)
        const message = err?.response?.data?.message || 'Erro ao carregar projetos.'
        setError(message)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Remover este projeto?')) return
    await api.delete(`/swagger/projects/${id}`)
    setProjects((prev) => prev.filter((p) => p._id !== id))
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Projetos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/upload')}
        >
          Novo Upload
        </Button>
      </Box>

      {error ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          py={10}
        >
          <Alert severity="error" sx={{ width: '100%', maxWidth: 560 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={load}>
            Recarregar
          </Button>
        </Box>
      ) : projects.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          py={10}
        >
          <Typography color="text.secondary" variant="h6">
            Nenhum projeto ainda
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/upload')}>
            Fazer upload de uma API
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {projects.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea
                  sx={{ height: '100%' }}
                  onClick={() => navigate(`/projects/${p._id}`)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" fontWeight="bold" gutterBottom noWrap sx={{ maxWidth: '80%' }}>
                        {p.name}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDelete(e, p._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {p.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {p.baseUrl}
                    </Typography>

                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                      <Chip
                        label={p.status === 'active' ? 'Ativo' : 'Erro'}
                        color={p.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip
                        label={`${p.tools.length} ferramentas`}
                        size="small"
                        variant="outlined"
                      />
                      {p.version && (
                        <Chip label={`v${p.version}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
