import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react'

const THEME_STORAGE_KEY = 'theme'

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setThemeState] = useState<Theme>('light')

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      } catch {
        // ignore write errors
      }
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  // Initialize theme on mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return
    let initial: Theme = 'light'
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') {
        initial = stored
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = 'dark'
      }
    } catch {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = 'dark'
      }
    }
    setTheme(initial)
  }, [setTheme])

  // Apply theme attribute to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  // Listen for OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler)
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handler)
      }
    }
  }, [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}