import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  Switch,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  IconFolder,
  IconMenu2,
  IconLogout,
  IconUser,
  IconLayoutDashboard,
  IconSettings,
  IconClipboardList,
  IconMessage2,
  IconLock,
  IconSun,
  IconMoon,
} from '@tabler/icons-react'
import api from '../api'
import { avatarLetter, avatarColor } from '../pages/Profile'
import { useColorMode, ColorMode } from '../theme/ColorModeContext'
import { useAuth, type UserPermissions } from '../context/AuthContext'

const SIDEBAR_WIDTH = 248

const NAV_SECTIONS: Array<{
  subheader: string
  items: Array<{ title: string; icon: React.ElementType; path: string; permission?: keyof UserPermissions; adminOnly?: boolean }>
}> = [
  {
    subheader: 'OVERVIEW',
    items: [
      { title: 'Dashboard', icon: IconLayoutDashboard, path: '/dashboard', permission: 'servers_view' },
    ],
  },
  {
    subheader: 'MAIN',
    items: [
      { title: 'Servers', icon: IconFolder, path: '/', permission: 'servers_view' },
      { title: 'Prompts', icon: IconMessage2, path: '/prompts', permission: 'prompts_view' },
      { title: 'Secrets', icon: IconLock, path: '/secrets', permission: 'secrets_view_names' },
    ],
  },
  {
    subheader: 'ADMINISTRATION',
    items: [
      { title: 'Settings', icon: IconSettings, path: '/settings', permission: 'settings_manage' },
      { title: 'Audit Logs', icon: IconClipboardList, path: '/audit-logs', permission: 'audit_view' },
    ],
  },
]


const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  background: `${theme.palette.background.paper}f2`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
  minHeight: '56px',
}))

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  color: theme.palette.text.secondary,
  minHeight: '56px !important',
  paddingLeft: '16px',
  paddingRight: '12px',
}))

type Status = 'checking' | 'online' | 'offline'

function SidebarContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const [logoError, setLogoError] = useState(false)
  const { can, isAdmin } = useAuth()

  const { mode } = useColorMode()
  const scrollbarStyles = {
    '&::-webkit-scrollbar': { width: '7px' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: mode === ColorMode.Dark ? '#3c4043' : '#e8eaed',
      borderRadius: '15px',
    },
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        ...scrollbarStyles,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          height: '56px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        {logoError ? (
          <Typography
            variant="h6"
            fontWeight={700}
            color="primary.main"
            sx={{ letterSpacing: '-0.4px', fontSize: '0.9375rem' }}
          >
            Arthur MCP
          </Typography>
        ) : (
          <Box
            component="img"
            src={mode === ColorMode.Dark ? '/images/logos/arthur_mcp_logo_dark_mode.svg' : '/images/logos/arthur_mcp_logo_light_mode.svg'}
            alt="Arthur MCP Adapter"
            sx={{ height: '100%', maxWidth: '100%' }}
            onError={() => setLogoError(true)}
          />
        )}
      </Box>

      {/* Menu */}
      <Box sx={{ flexGrow: 1, py: 1 }}>
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.adminOnly) return isAdmin
            if (item.permission) return can(item.permission)
            return true
          })
          if (visibleItems.length === 0) return null
          return (
          <List
            key={section.subheader}
            subheader={
              <ListSubheader
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'text.disabled',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                  bgcolor: 'transparent',
                  px: 2.5,
                  pt: 2,
                  pb: 0.75,
                  textTransform: 'uppercase',
                }}
              >
                {section.subheader}
              </ListSubheader>
            }
            dense
            disablePadding
          >
            {visibleItems.map((item) => {
              const Icon = item.icon
              const selected = location.pathname === item.path
              return (
                <ListItem key={item.path} disablePadding sx={{ px: 1.5, py: '1px' }}>
                  <ListItemButton
                    selected={selected}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '8px',
                      minHeight: 38,
                      px: 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(26,115,232,0.08)',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                        '&:hover': { bgcolor: 'rgba(26,115,232,0.12)' },
                      },
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: selected ? 'primary.main' : 'text.secondary' }}>
                      <Icon stroke={selected ? 2 : 1.5} size="1.1rem" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.8375rem',
                        fontWeight: selected ? 600 : 400,
                        color: selected ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
          )
        })}
      </Box>

      {/* Bottom promo box */}
      <Box sx={{ p: 1.5, pb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'primary.light',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: 'rgba(93,135,255,0.15)',
          }}
        >
          <Typography fontWeight={700} fontSize="0.8rem" color="primary.dark" mb={0.25}>
            Arthur MCP Adapter
          </Typography>
          <Typography fontSize="0.72rem" color="text.secondary" lineHeight={1.4}>
            Connect your AI to your APIs
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [status, setStatus] = useState<Status>('checking')
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const [username, setUsername] = useState('')
  const navigate = useNavigate()
  const { mode, toggle } = useColorMode()
  const { logout } = useAuth()

  useEffect(() => {
    api.get('/health')
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'))
  }, [])

  useEffect(() => {
    api.get<{ username: string }>('/users/me')
      .then((r) => setUsername(r.data.username))
      .catch(() => { /* silently ignore */ })
  }, [])

  const statusColor: Record<Status, 'default' | 'success' | 'error'> = {
    checking: 'default',
    online: 'success',
    offline: 'error',
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar desktop */}
      {mdUp && (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          <Drawer
            variant="permanent"
            anchor="left"
            open
            PaperProps={{
              sx: {
                width: SIDEBAR_WIDTH,
                boxSizing: 'border-box',
                border: 'none',
                borderRight: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                bgcolor: 'background.paper',
              },
            }}
          >
            <SidebarContent />
          </Drawer>
        </Box>
      )}

      {/* Sidebar mobile */}
      {!mdUp && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              boxShadow: theme.shadows[6],
              border: 'none',
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Main content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
          bgcolor: 'background.default',
        }}
      >
        {/* Header */}
        <AppBarStyled position="sticky" color="default">
          <ToolbarStyled>
            {!mdUp && (
              <IconButton
                color="inherit"
                aria-label="open menu"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 1 }}
              >
                <IconMenu2 width={20} height={20} />
              </IconButton>
            )}

            <Box flexGrow={1} />

            {/* Dark mode toggle */}
            <Tooltip title={mode === ColorMode.Dark ? 'Light mode' : 'Dark mode'}>
              <Box display="flex" alignItems="center" gap={0.5} mr={0.5}>
                <IconSun size={15} style={{ opacity: mode === ColorMode.Light ? 1 : 0.4 }} />
                <Switch
                  size="small"
                  checked={mode === ColorMode.Dark}
                  onChange={toggle}
                  color="default"
                  sx={{
                    '& .MuiSwitch-thumb': { bgcolor: mode === ColorMode.Dark ? '#e8eaed' : '#5f6368' },
                    '& .MuiSwitch-track': { bgcolor: mode === ColorMode.Dark ? '#5f6368 !important' : undefined },
                  }}
                />
                <IconMoon size={15} style={{ opacity: mode === ColorMode.Dark ? 1 : 0.4 }} />
              </Box>
            </Tooltip>

            {/* Profile */}
            <Tooltip title="Account menu">
              <IconButton
                size="small"
                color="inherit"
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{ p: 0.5, ml: 0.5 }}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    bgcolor: username ? avatarColor(username) : 'primary.main',
                  }}
                >
                  {username ? avatarLetter(username) : <IconUser size={16} />}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              PaperProps={{ sx: { width: 200, mt: 0.5 } }}
            >
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/profile') }}>
                <ListItemIcon><IconUser size={18} /></ListItemIcon>
                <ListItemText>My Profile</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => { setProfileAnchor(null); handleLogout() }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}><IconLogout size={18} /></ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </ToolbarStyled>
        </AppBarStyled>

        {/* Page content */}
        <Container
          maxWidth={false}
          sx={{ maxWidth: '1280px', pt: 2, pb: 6, flexGrow: 1, px: { xs: 2, md: 3 } }}
        >
          <Box sx={{ minHeight: 'calc(100vh - 136px)' }}>
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
