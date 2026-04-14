// store/themeStore.ts
import { create } from 'zustand'

interface ThemeState {
  darkMode: boolean
  toggleTheme: () => void
  setDarkMode: (dark: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: false,
  toggleTheme: () =>
    set((state) => {
      const next = !state.darkMode
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', next ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', next)
      }
      return { darkMode: next }
    }),
  setDarkMode: (dark) =>
    set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', dark ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', dark)
      }
      return { darkMode: dark }
    }),
}))

/** 初始化主题：读取 localStorage 或系统偏好 */
export function initTheme() {
  if (typeof window === 'undefined') return

  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = stored ? stored === 'dark' : prefersDark

  document.documentElement.classList.toggle('dark', dark)
  useThemeStore.setState({ darkMode: dark })
}
