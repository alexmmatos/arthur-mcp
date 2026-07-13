import { useMemo, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import baselightTheme, { basedarkTheme } from './index'
import { ColorMode } from './colorMode.enum'
import type { ColorModeContextType } from './colorModeContextType.interface'
import { ColorModeContext } from './colorMode.context'
import type { ColorModeProviderProps } from './colorModeProviderProps.interface'

export { ColorMode } from './colorMode.enum'
export { useColorMode } from './useColorMode.hook'

export function ColorModeProvider({ children }: ColorModeProviderProps) {
  const [mode, setMode] = useState<ColorMode>(() => {
    return (localStorage.getItem('colorMode') as ColorMode) ?? ColorMode.Dark
  })

  const ctx = useMemo<ColorModeContextType>(() => ({
    mode,
    toggle: () => {
      setMode((prev) => {
        const next = prev === ColorMode.Light ? ColorMode.Dark : ColorMode.Light
        localStorage.setItem('colorMode', next)
        return next
      })
    },
  }), [mode])

  const theme = mode === ColorMode.Dark ? basedarkTheme : baselightTheme

  return (
    <ColorModeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
