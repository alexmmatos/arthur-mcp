import { useState, type ReactNode } from 'react'
import type { ContextualNavTab } from './contextualNavTab.type'
import type { ServerNavItem } from './serverNavItem.interface'
import type { ServerDetailNav } from './serverDetailNav.interface'
import type { ServerNavContextValue } from './serverNavContextValue.interface'
import { ServerNavContext } from './serverNav.context'
import type { ServerNavProviderProps } from './serverNavProviderProps.interface'

export type { ContextualNavTab } from './contextualNavTab.type'
export type { ServerNavItem } from './serverNavItem.interface'
export type { ServerDetailNav } from './serverDetailNav.interface'
export { useServerNav } from './useServerNav.hook'

export function ServerNavProvider({ children }: ServerNavProviderProps) {
  const [serverDetail, setServerDetail] = useState<ServerDetailNav | null>(null)
  return (
    <ServerNavContext.Provider value={{ serverDetail, setServerDetail }}>
      {children}
    </ServerNavContext.Provider>
  )
}
