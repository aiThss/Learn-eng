/**
 * App Root Component
 * Theme initialization + Router
 */
import { useEffect } from 'react'
import AppRouter from '@/routes/AppRouter'
import { useSettingsStore } from '@/store'

export default function App() {
  const { settings } = useSettingsStore()

  // Đồng bộ dark mode với document class
  useEffect(() => {
    const root = document.documentElement
    if (settings.darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings.darkMode])

  return <AppRouter />
}
