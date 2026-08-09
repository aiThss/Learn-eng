/**
 * App Shell - Layout chính với Bottom Navigation
 * Outlet render nội dung từng trang
 * Chống back bằng React Router history + beforeunload handler
 */
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopBar from './TopBar'
import { cn } from '@/lib/utils'

// Các trang không hiển thị TopBar
const HIDE_TOPBAR: string[] = ['/ai-tutor']
// Các trang không hiển thị BottomNav
const HIDE_BOTTOMNAV: string[] = []

export default function AppShell() {
  const location = useLocation()
  
  const showTopBar = !HIDE_TOPBAR.includes(location.pathname)
  const showBottomNav = !HIDE_BOTTOMNAV.includes(location.pathname)

  return (
    <div
      className={cn(
        'relative mx-auto flex h-[100dvh] min-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden',
        'bg-background text-foreground shadow-2xl shadow-slate-950/10'
      )}
    >
      {/* Top Bar */}
      {showTopBar && <TopBar />}

      {/* Main Content - scroll area */}
      <main
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'min-h-0 overscroll-contain',
          showTopBar ? 'pt-[calc(3.5rem+env(safe-area-inset-top))]' : 'pt-0',
          showBottomNav ? 'pb-[calc(5rem+env(safe-area-inset-bottom))]' : 'pb-4',
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
