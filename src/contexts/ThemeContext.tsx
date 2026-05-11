import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    const initial = saved ?? 'dark'
    if (initial === 'light') document.documentElement.classList.add('light')
    return initial
  })

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'

    const apply = () => {
      document.documentElement.classList.toggle('light', next === 'light')
      localStorage.setItem('theme', next)
      setTheme(next)
    }

    if (!('startViewTransition' in document)) {
      apply()
      return
    }

    // Mark direction so CSS can style old/new layers differently
    document.documentElement.dataset.transitioning = next
    ;(document as unknown as { startViewTransition: (cb: () => void) => { finished: Promise<void> } })
      .startViewTransition(() => {
        apply()
      })
      .finished.finally(() => {
        delete document.documentElement.dataset.transitioning
      })
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
