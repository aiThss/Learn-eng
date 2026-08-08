/**
 * App Root Component
 * Theme initialization + Router
 */
import { useEffect } from 'react'
import AppRouter from '@/routes/AppRouter'
import { createInitialProgress, useLessonStore, useProgressStore, useSettingsStore, useUserStore } from '@/store'

export default function App() {
  const { settings } = useSettingsStore()
  const { user } = useUserStore()
  const { setPhase, setWeek } = useLessonStore()
  const { progress, setProgress } = useProgressStore()

  // Đồng bộ dark mode với document class
  useEffect(() => {
    const root = document.documentElement
    if (settings.darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Tôn trọng lựa chọn cỡ chữ trên toàn bộ app, bao gồm các component dùng rem.
    root.style.fontSize = settings.fontSize === 'small' ? '15px' : settings.fontSize === 'large' ? '17px' : '16px'
  }, [settings.darkMode, settings.fontSize])

  // Migration an toàn cho dữ liệu cũ: phase/week trong user là nguồn chuẩn.
  // Nhờ vậy bản nâng cấp không đưa người học đã placement vào lại Phase A0.
  useEffect(() => {
    if (!user) return
    setPhase(user.currentPhase)
    setWeek(user.currentWeek)
    if (!progress || progress.userId !== user.id) {
      setProgress(createInitialProgress(user.id))
    }
  }, [progress, setPhase, setProgress, setWeek, user])

  return <AppRouter />
}
