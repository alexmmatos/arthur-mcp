import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  IconBellRinging,
  IconFolder,
  IconMenu2,
  IconUpload,
  IconServer,
  IconBook,
  IconLogout,
  IconUser,
} from '@tabler/icons-react'
import api from '../api'

const SIDEBAR_WIDTH = 270

const NAV_SECTIONS = [
  {
    subheader: 'PRINCIPAL',
    items: [
      { title: 'Projetos', icon: IconFolder, path: '/' },
      { title: 'Upload', icon: IconUpload, path: '/upload' },
    ],
  },
  {
    subheader: 'SERVIDOR',
    items: [
      { title: 'Servidor MCP', icon: IconServer, path: '/mcp-server' },
    ],
  },
]

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  background: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  justifyContent: 'center',
  backdropFilter: 'blur(4px)',
  minHeight: '70px',
}))

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  color: theme.palette.text.secondary,
  minHeight: '70px !important',
}))

type Status = 'checking' | 'online' | 'offline'

function SidebarContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()

  const scrollbarStyles = {
    '&::-webkit-scrollbar': { width: '7px' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#eff2f7',
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
          px: 3,
          height: '70px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src="/images/logos/dark-logo.svg"
          alt="MCP Convert"
          sx={{ height: 38 }}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            img.style.display = 'none'
          }}
        />
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary.main"
          ml={1}
          sx={{ letterSpacing: '-0.3px' }}
        >
          MCP Convert
        </Typography>
      </Box>

      {/* Menu */}
      <Box sx={{ flexGrow: 1, pt: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <List
            key={section.subheader}
            subheader={
              <ListSubheader
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.06em',
                  lineHeight: '2.5',
                  bgcolor: 'transparent',
                  px: 3,
                  mt: 1,
                }}
              >
                {section.subheader}
              </ListSubheader>
            }
            dense
          >
            {section.items.map((item) => {
              const Icon = item.icon
              const selected = location.pathname === item.path
              return (
                <ListItem key={item.path} disablePadding sx={{ px: 2, py: '2px' }}>
                  <ListItemButton
                    selected={selected}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '8px',
                      minHeight: 44,
                      px: 2,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                        '&:hover': { bgcolor: 'primary.light' },
                      },
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: selected ? 'primary.main' : 'text.secondary' }}>
                      <Icon stroke={1.5} size="1.2rem" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: selected ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        ))}
      </Box>

      {/* Bottom promo box */}
      <Box sx={{ p: 2, pb: 3 }}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.light',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontSize="0.875rem" mb={0.5}>
              MCP Protocol
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
              Conecte sua IA às suas APIs
            </Typography>
          </Box>
          <Box
            component="img"
            src="/images/backgrounds/rocket.png"
            alt=""
            sx={{ height: 48, width: 48, objectFit: 'contain', flexShrink: 0 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [status, setStatus] = useState<Status>('checking')
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/health')
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'))
  }, [])

  const statusColor: Record<Status, 'default' | 'success' | 'error'> = {
    checking: 'default',
    online: 'success',
    offline: 'error',
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar desktop */}
      {lgUp && (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          <Drawer
            variant="permanent"
            anchor="left"
            open
            PaperProps={{
              sx: { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: 'none' },
            }}
          >
            <SidebarContent />
          </Drawer>
        </Box>
      )}

      {/* Sidebar mobile */}
      {!lgUp && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              boxShadow: theme.shadows[8],
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
            {!lgUp && (
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

            {/* Server status */}
            <Chip
              label={status}
              color={statusColor[status]}
              size="small"
              sx={{ mr: 1, fontWeight: 600, fontSize: '0.7rem' }}
            />

            {/* Bell */}
            <IconButton size="large" color="inherit">
              <Badge variant="dot" color="primary">
                <IconBellRinging size={21} stroke={1.5} />
              </Badge>
            </IconButton>

            {/* Profile */}
            <IconButton
              size="large"
              color="inherit"
              onClick={(e) => setProfileAnchor(e.currentTarget)}
            >
              <Avatar
                src="/images/profile/user-1.jpg"
                alt="user"
                sx={{ width: 35, height: 35 }}
              />
            </IconButton>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              PaperProps={{ sx: { width: 200, mt: 0.5 } }}
            >
              <MenuItem onClick={() => setProfileAnchor(null)}>
                <ListItemIcon><IconUser size={18} /></ListItemIcon>
                <ListItemText>Meu perfil</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => { setProfileAnchor(null); handleLogout() }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}><IconLogout size={18} /></ListItemIcon>
                <ListItemText>Sair</ListItemText>
              </MenuItem>
            </Menu>
          </ToolbarStyled>
        </AppBarStyled>

        {/* Page content */}
        <Container
          maxWidth={false}
          sx={{ maxWidth: '1200px', pt: '20px', pb: '60px', flexGrow: 1 }}
        >
          <Box sx={{ minHeight: 'calc(100vh - 170px)' }}>
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
