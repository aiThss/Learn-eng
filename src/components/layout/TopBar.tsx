/**
 * Top Bar - Header cho các trang
 * Hiển thị tiêu đề trang, streak, XP, và menu
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Flame, Zap, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgressStore, useUserStore } from '@/store'

// Map route → title tiếng Việt
const PAGE_TITLES: Record<string, string> = {
  '/': 'EnglishUp',
  '/roadmap': 'Lộ trình học',
  '/lesson/today': 'Bài học hôm nay',
  '/vocabulary': 'Từ vựng',
  '/grammar': 'Ngữ pháp',
  '/listening': 'Nghe',
  '/speaking': 'Nói',
  '/reading-writing': 'Đọc & Viết',
  '/practice': 'Luyện tập',
  '/progress': 'Tiến độ',
  '/ai-tutor': 'AI Tutor',
  '/settings': 'Cài đặt',
  '/review': 'Ôn tập',
  '/download': 'Tải Android',
}

// Trang có nút back
const BACK_PAGES = [
  '/roadmap', '/lesson/today', '/grammar', '/listening',
  '/speaking', '/reading-writing', '/review', '/download',
]

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { progress } = useProgressStore()
  const { user } = useUserStore()

  const isHome = location.pathname === '/'
  const showBack = BACK_PAGES.includes(location.pathname)
  const title = PAGE_TITLES[location.pathname] ?? 'EnglishUp'
  const streak = progress?.currentStreak ?? 0
  const xp = progress?.totalXP ?? 0

  const handleBack = () => {
    // Với deep link hoặc khi Android mở lại app, history có thể không có trang trước.
    // Luôn đưa người học về Dashboard thay vì rời khỏi ứng dụng.
    const historyIndex = window.history.state?.idx
    if (typeof historyIndex === 'number' && historyIndex > 0) {
      navigate(-1)
      return
    }
    navigate('/', { replace: true })
  }

  const avatarIsImage = Boolean(user?.avatar && /^(https?:|data:image\/)/.test(user.avatar))

  return (
    <header
      className={cn(
        'fixed top-0 left-1/2 -translate-x-1/2',
        'w-full max-w-2xl min-h-[3.5rem] h-[calc(3.5rem+env(safe-area-inset-top))]',
        'bg-background/95 backdrop-blur-md border-b border-border',
        'grid grid-cols-[1fr_auto_1fr] items-center px-4 pt-[env(safe-area-inset-top)]',
        'z-40'
      )}
    >
      {/* Trái: Back hoặc Avatar */}
      <div className="flex min-w-0 items-center">
        {showBack ? (
          <button
            id="btn-back"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Quay lại"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        ) : isHome && avatarIsImage ? (
          <img
            src={user?.avatar}
            alt={user?.name ?? 'Ảnh đại diện'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden text-white text-sm font-semibold">
            {user?.avatar && !avatarIsImage ? user.avatar : user?.name?.[0] ?? (
              <img src="/lumina-logo.png" alt="Lumina" className="h-full w-full object-cover" />
            )}
          </div>
        )}
      </div>

      {/* Giữa: Tiêu đề */}
      <h1
        className={cn(
          'min-w-0 truncate px-3 text-center font-semibold text-base',
          isHome && 'text-gradient text-lg'
        )}
      >
        {title}
      </h1>

      {/* Phải: Streak + XP hoặc Settings */}
      <div className="flex min-w-0 items-center justify-end">
        {isHome ? (
          <div className="flex items-center gap-2">
            {/* Streak */}
            <div className="flex items-center gap-0.5">
              <Flame
                size={18}
                className={streak > 0 ? 'text-emerald-600' : 'text-muted-foreground'}
                fill={streak > 0 ? 'currentColor' : 'none'}
              />
              <span className={cn(
                'text-sm font-bold',
                streak > 0 ? 'text-emerald-600' : 'text-muted-foreground'
              )}>
                {streak}
              </span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-0.5">
              <Zap size={16} className="text-primary" fill="currentColor" />
              <span className="text-sm font-bold text-primary">
                {xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}
              </span>
            </div>
          </div>
        ) : (
          <button
            id="btn-settings-topbar"
            onClick={() => navigate('/settings')}
            className="p-2 -mr-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Cài đặt"
          >
            <Settings size={20} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </header>
  )
}
