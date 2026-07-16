import { Box, Button, Grid, InputAdornment, Skeleton, TextField, Typography } from '@mui/material'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import { AppSnackbar, ConfirmDialog, HelpButton } from '../../components'
import { Permission, useAuth } from '../../context/auth'
import { AppCard, type McpApp } from '../../features/apps'
import { useListPageLogic } from '../../hooks'

export default function Apps() {
  const { t } = useTranslation(['apps', 'common'])
  const navigate = useNavigate()
  const { can } = useAuth()
  const [state, handlers] = useListPageLogic<McpApp>({
    loadItems: () => api.get<McpApp[]>('/mcp-apps').then((response) => response.data),
    deleteItem: (id) => api.delete(`/mcp-apps/${id}`),
    permission: Permission.AppsView,
  })
  const visible = state.items.filter((app) => {
    const query = state.search.trim().toLowerCase()
    return !query || [app.name, app.description, app.serverName, app.toolName]
      .some((value) => value?.toLowerCase().includes(query))
  })

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{t('heading.title')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('heading.subtitle')}</Typography>
          </Box>
          <HelpButton title={t('help.title')}>
            <Typography variant="body2" paragraph>{t('help.intro')}</Typography>
            <Typography variant="body2" paragraph><strong>{t('label.source')}:</strong> {t('help.source')}</Typography>
            <Typography variant="body2" paragraph><strong>{t('label.viewType')}:</strong> {t('help.view')}</Typography>
            <Typography variant="body2"><strong>{t('label.connectionUrl')}:</strong> {t('help.host')}</Typography>
          </HelpButton>
        </Box>
        {can(Permission.AppsCreate) && <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => navigate('/apps/new')}>{t('action.newApp')}</Button>}
      </Box>

      <TextField
        size="small" value={state.search} onChange={(event) => handlers.setSearch(event.target.value)}
        placeholder={t('placeholder.search')} sx={{ mb: 3, width: { xs: '100%', sm: 300 } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment> }}
      />

      {state.loading ? (
        <Grid container spacing={2}>{Array.from({ length: 3 }).map((_, index) => <Grid item xs={12} sm={6} md={4} key={index}><Skeleton variant="rounded" height={165} /></Grid>)}</Grid>
      ) : state.items.length === 0 ? (
        <Box py={8} textAlign="center"><Typography color="text.secondary">{t('empty.noApps')}</Typography></Box>
      ) : visible.length === 0 ? (
        <Box py={8} textAlign="center"><Typography color="text.secondary">{t('empty.noMatch')}</Typography></Box>
      ) : (
        <Grid container spacing={2}>{visible.map((app) => <Grid item xs={12} sm={6} md={4} key={app.id}><AppCard app={app} onEdit={(item) => navigate(`/apps/${item.id}`)} onDelete={handlers.handleDeleteRequest} /></Grid>)}</Grid>
      )}

      <ConfirmDialog
        open={state.deleteTarget !== null} title={t('confirm.deleteTitle', { name: state.deleteTarget?.name ?? '' })}
        message={t('confirm.deleteMessage')} confirmLabel={t('action.delete')} confirmColor="error"
        loading={state.deleting} onConfirm={handlers.handleDeleteConfirm} onClose={handlers.handleDeleteCancel}
      />
      <AppSnackbar
        open={state.snack !== null}
        message={state.snack?.severity === 'success' ? t('success.deleted') : t(state.snack?.message === 'error.loadFailed' ? 'error.load' : 'error.deleteFailed')}
        severity={state.snack?.severity ?? 'success'} onClose={() => handlers.setSnack(null)}
      />
    </Box>
  )
}
