import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api'

type TermKey = 'server' | 'tool' | 'resource' | 'prompt' | 'chain' | 'secret'

interface TerminologyContextValue {
  terms: Partial<Record<TermKey, string>>
  reload: () => void
}

const TerminologyContext = createContext<TerminologyContextValue>({
  terms: {},
  reload: () => {},
})

export function TerminologyProvider({ children }: { children: React.ReactNode }) {
  const [terms, setTerms] = useState<Partial<Record<TermKey, string>>>({})

  const load = useCallback(() => {
    api.get<{
      termServer?: string
      termTool?: string
      termResource?: string
      termPrompt?: string
      termChain?: string
      termSecret?: string
    }>('/settings')
      .then((r) => {
        const d = r.data
        const next: Partial<Record<TermKey, string>> = {}
        if (d.termServer) next.server = d.termServer
        if (d.termTool) next.tool = d.termTool
        if (d.termResource) next.resource = d.termResource
        if (d.termPrompt) next.prompt = d.termPrompt
        if (d.termChain) next.chain = d.termChain
        if (d.termSecret) next.secret = d.termSecret
        setTerms(next)
      })
      .catch(() => {
        // Non-fatal: fall back to defaults
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) load()
  }, [load])

  return (
    <TerminologyContext.Provider value={{ terms, reload: load }}>
      {children}
    </TerminologyContext.Provider>
  )
}

export function useTerm(key: TermKey): string {
  const { terms } = useContext(TerminologyContext)
  const { t } = useTranslation('common')
  return terms[key] || t(`terms.${key}`)
}

export function useTerminology() {
  return useContext(TerminologyContext)
}
