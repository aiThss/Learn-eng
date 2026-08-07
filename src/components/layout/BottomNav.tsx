/**
 * Bottom Navigation Bar
 * 5 tab chính: Home, Vocab, Practice, Progress, AI Tutor
 */
import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, Dumbbell, BarChart2, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLessonStore } from '@/store'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Trang chủ', exact: true },
  { to: '/vocabulary', icon: BookOpen, label: 'Từ vựng', exact: false },
  { to: '/practice', icon: Dumbbell, label: 'Luyện tập', exact: false },
  { to: '/progress', icon: BarChart2, label: 'Tiến độ', exact: false },
  { to: '/ai-tutor', icon: Bot, label: 'AI Tutor', exact: false },
] as const

export default function BottomNav() {
  const location = useLocation()
  const { dueCardsCount } = useLessonStore()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-1/2 -translate-x-1/2',
        'w-full max-w-md',
        'bg-card/95 backdrop-blur-md border-t border-border',
        'safe-bottom',
        'z-50'
      )}
      aria-label="Navigation chính"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to)

          // Badge count cho Vocabulary tab
          const showBadge = to === '/vocabulary' && dueCardsCount > 0

          return (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
              className={cn(
                'relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl',
                'transition-all duration-200 min-w-[56px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon với background khi active */}
              <div
                className={cn(
                  'relative p-1.5 rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/15'
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn(
                    'transition-all duration-200',
                    isActive && 'scale-110'
                  )}
                />

                {/* Badge số card cần ôn */}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-pulse-soft">
                    {dueCardsCount > 99 ? '99+' : dueCardsCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  'transition-all duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
