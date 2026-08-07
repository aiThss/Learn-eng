/**
 * App Shell - Layout chính với Bottom Navigation
 * Outlet render nội dung từng trang
 * Chống back bằng React Router history + beforeunload handler
 */
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import BottomNav from './BottomNav'
import TopBar from './TopBar'
import { useSettingsStore } from '@/store'
import { cn } from '@/lib/utils'

// Các trang không hiển thị TopBar
const HIDE_TOPBAR: string[] = ['/ai-tutor']
// Các trang không hiển thị BottomNav
const HIDE_BOTTOMNAV: string[] = []

export default function AppShell() {
  const location = useLocation()
  const { settings } = useSettingsStore()
  
  const showTopBar = !HIDE_TOPBAR.includes(location.pathname)
  const showBottomNav = !HIDE_BOTTOMNAV.includes(location.pathname)

  // Áp dụng dark mode lên document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  // Chống mất state khi đóng tab (warn user)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Chỉ warn khi đang trong bài tập
      const learningPaths = ['/vocabulary', '/grammar', '/speaking', '/listening', '/practice']
      if (learningPaths.some(p => location.pathname.startsWith(p))) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [location.pathname])

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen bg-background text-foreground',
        'max-w-md mx-auto relative' // Mobile-first, max width tablet
      )}
    >
      {/* Top Bar */}
      {showTopBar && <TopBar />}

      {/* Main Content - scroll area */}
      <main
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          showTopBar ? 'pt-14' : 'pt-0', // Dưới TopBar
          showBottomNav ? 'pb-20' : 'pb-4', // Trên BottomNav
          'safe-top safe-bottom',
          'page-transition'
        )}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  )
}
