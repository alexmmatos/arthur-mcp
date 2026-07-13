import type { UserPermissions } from '../../../context/AuthContext'

export type NavItem = {
  titleKey: string
  icon: React.ElementType
  path: string
  permission?: keyof UserPermissions
  adminOnly?: boolean
  wip?: boolean
}
