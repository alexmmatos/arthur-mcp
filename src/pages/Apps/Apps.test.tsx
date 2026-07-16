import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../api', () => ({ default: { get: vi.fn(), delete: vi.fn() } }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, variables?: Record<string, unknown>) => ({
    'heading.title': 'Apps', 'heading.subtitle': 'Interactive Tool interfaces',
    'action.newApp': 'New App', 'action.delete': 'Delete App',
    'placeholder.search': 'Search Apps', 'empty.noApps': 'No Apps yet', 'empty.noMatch': 'No matching Apps',
    'confirm.deleteTitle': `Delete ${variables?.name ?? ''}?`, 'confirm.deleteMessage': 'Remove interface',
    'success.deleted': 'App deleted', 'label.inactive': 'Inactive', 'label.updated': 'Updated',
    'view.table': 'Table', 'common:action.delete': 'Delete',
  }[key] ?? key) }),
}))
vi.mock('../../context/auth', () => ({
  Permission: { AppsView: 'apps_view', AppsCreate: 'apps_create', AppsEdit: 'apps_edit', AppsDelete: 'apps_delete' },
  useAuth: () => ({ can: () => true, loading: false }),
}))
const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(), useNavigate: () => navigate,
}))

import api from '../../api'
import Apps from '.'

describe('Apps page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the empty state and creation action', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })
    render(<Apps />, { wrapper: MemoryRouter })

    expect(await screen.findByText('No Apps yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'New App' }))
    expect(navigate).toHaveBeenCalledWith('/apps/new')
  })

  it('renders and filters App cards', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [
      { id: 'a1', name: 'Orders', serverName: 'Commerce', serverId: 's1', toolName: 'list_orders', viewType: 'table', viewConfig: {}, resourceUri: 'ui://a1', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'a2', name: 'Tickets', serverName: 'Support', serverId: 's2', toolName: 'list_tickets', viewType: 'table', viewConfig: {}, resourceUri: 'ui://a2', isActive: true, createdAt: '', updatedAt: '' },
    ] })
    render(<Apps />, { wrapper: MemoryRouter })

    expect(await screen.findByText('Orders')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Search Apps'), { target: { value: 'support' } })
    expect(screen.queryByText('Orders')).not.toBeInTheDocument()
    expect(screen.getByText('Tickets')).toBeInTheDocument()
  })

  it('deletes only the App after confirmation', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [
      { id: 'a1', name: 'Orders', serverName: 'Commerce', serverId: 's1', toolName: 'list_orders', viewType: 'table', viewConfig: {}, resourceUri: 'ui://a1', isActive: true, createdAt: '', updatedAt: '' },
    ] })
    ;(api.delete as ReturnType<typeof vi.fn>).mockResolvedValue({})
    render(<Apps />, { wrapper: MemoryRouter })

    expect(await screen.findByText('Orders')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Delete'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete App' }))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/mcp-apps/a1'))
  })
})
