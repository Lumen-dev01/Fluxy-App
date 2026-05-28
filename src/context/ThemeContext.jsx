// =============================================
// THEME CONTEXT
//
// Manages dark/light mode for the entire app.
// - Default: dark mode
// - Saves preference to localStorage
// - Toggles 'dark' class on <html> element
// - Tailwind uses this class for dark: variants
// =============================================

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  // Get saved theme from localStorage, default to 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fluxy-theme') || 'dark'
  })

  // Apply theme class to <html> element whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    // Save to localStorage so preference persists
    localStorage.setItem('fluxy-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
