import type { Me } from './me.interface'
import type { UserPermissions } from './userPermissions.interface'

export interface AuthContextValue {
  me: Me | null
  loading: boolean
  can: (key: keyof UserPermissions) => boolean
  isAdmin: boolean
  reload: () => void
  logout: () => void
}
