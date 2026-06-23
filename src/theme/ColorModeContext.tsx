import { createContext, useContext, useMemo, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import baselightTheme, { basedarkTheme } from './index'

export enum ColorMode {
  Light = 'light',
  Dark = 'dark',
}

interface ColorModeContextType {
  mode: ColorMode
  toggle: () => void
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: ColorMode.Light,
  toggle: () => {},
})

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
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
