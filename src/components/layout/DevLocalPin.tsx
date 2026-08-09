import { useState } from 'react'
import { ExternalLink, Pin, RotateCcw, X, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DEV_LOCAL_URL, showDevLocalPin } from '@/config/devLocal'
import { createInitialProgress, useLessonStore, useProgressStore, useUserStore } from '@/store'
import type { User } from '@/types'

const BACKUP_KEY = 'englishup-dev-local-backup'
const PERSISTED_KEYS = ['englishup-user', 'englishup-progress', 'englishup-lesson'] as const
const DEV_USER_ID = 'dev-local-preview'

type Backup = Record<(typeof PERSISTED_KEYS)[number], string | null>

function saveCurrentProfile(): void {
  if (sessionStorage.getItem(BACKUP_KEY)) return
  const backup = Object.fromEntries(PERSISTED_KEYS.map((key) => [key, localStorage.getItem(key)])) as Backup
  sessionStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
}

function restorePreviousProfile(): boolean {
  const value = sessionStorage.getItem(BACKUP_KEY)
  if (!value) return false

  const backup = JSON.parse(value) as Backup
  PERSISTED_KEYS.forEach((key) => {
    const savedValue = backup[key]
    if (savedValue === null) localStorage.removeItem(key)
    else localStorage.setItem(key, savedValue)
  })
  sessionStorage.removeItem(BACKUP_KEY)
  window.location.assign('/')
  return true
}

/**
 * Dev-only floating helper inspired by the Check-in-Love quick-test pin.
 * It never ships in a standard production build and preserves the current
 * local profile in session storage before loading mock data.
 */
export default function DevLocalPin() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { user, completeOnboarding, clearUser } = useUserStore()
  const { setProgress, clearProgress } = useProgressStore()
  const { setPhase, setWeek, setSRSCards } = useLessonStore()

  if (!showDevLocalPin) return null

  const isPreview = user?.id === DEV_USER_ID
  const loadPreview = () => {
    saveCurrentProfile()
    const previewUser: User = {
      id: DEV_USER_ID,
      name: 'Minh · Dev Local',
      avatar: '🧪',
      authProvider: 'local',
      createdAt: new Date(),
      currentPhase: 'PHASE_1',
      currentWeek: 3,
      targetScore: 'IELTS',
      learningMode: 'QUICK',
      dailyGoalMinutes: 20,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
    completeOnboarding(previewUser)
    setProgress({
      ...createInitialProgress(previewUser.id),
      totalXP: 320,
      currentStreak: 6,
      longestStreak: 9,
      vocabularyCount: 42,
      masteredWordCount: 18,
      grammarLessonsCompleted: 4,
      listeningMinutes: 28,
    })
    setPhase('PHASE_1')
    setWeek(3)
    setIsOpen(false)
    navigate('/')
  }

  const resetPreview = () => {
    clearUser()
    clearProgress()
    setSRSCards([])
    setPhase('PHASE_0')
    setWeek(1)
    setIsOpen(false)
    navigate('/onboarding', { replace: true })
  }

  const jumpTo = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-50">
      {isOpen && (
        <section className="mb-2 w-72 overflow-hidden rounded-2xl border border-amber-300 bg-white text-slate-900 shadow-2xl shadow-slate-950/25">
          <header className="flex items-center justify-between bg-amber-100 px-3 py-2.5">
            <div>
              <p className="text-sm font-black">🛠 Dev Local · Quick Test</p>
              <p className="text-[11px] text-amber-900/70">Chỉ hiện khi chạy Vite / Dev Local</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-amber-950 hover:bg-amber-200" aria-label="Đóng Dev Local">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="space-y-3 p-3">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Nhảy nhanh</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  ['Trang chủ', '/'],
                  ['Bài hôm nay', '/lesson/today'],
                  ['Luyện nghe', '/listening'],
                  ['Từ vựng', '/vocabulary'],
                  ['Cài đặt', '/settings'],
                  ['Onboarding', '/onboarding'],
                ].map(([label, path]) => (
                  <button key={path} type="button" onClick={() => jumpTo(path)} className="rounded-lg bg-slate-100 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
              <p className="text-xs font-semibold text-amber-950">{isPreview ? 'Đang dùng profile mẫu Dev Local' : 'Profile hiện tại sẽ được backup tạm trong session'}</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <button type="button" onClick={loadPreview} className="flex items-center justify-center gap-1 rounded-lg bg-amber-400 px-2 py-2 text-xs font-bold text-amber-950 hover:bg-amber-300">
                  <Zap className="h-3.5 w-3.5" /> Nạp demo
                </button>
                <button type="button" onClick={resetPreview} className="flex items-center justify-center gap-1 rounded-lg border border-amber-300 bg-white px-2 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset test
                </button>
              </div>
              {sessionStorage.getItem(BACKUP_KEY) && (
                <button type="button" onClick={restorePreviousProfile} className="mt-1.5 w-full rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
                  Khôi phục profile trước test
                </button>
              )}
            </div>

            <a href={DEV_LOCAL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              Mở LAN: {DEV_LOCAL_URL.replace(/^https?:\/\//, '')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        data-testid="dev-local-pin"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 shadow-lg shadow-amber-950/20 transition-transform hover:scale-[1.02]"
        title="Mở Dev Local Quick Test"
      >
        <Pin className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
        Dev Local
      </button>
    </div>
  )
}
