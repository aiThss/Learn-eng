/**
 * Dashboard - Trang chính hiển thị tổng quan học tập
 * Chào người dùng, hiển thị tiến độ, streak, và quick links
 */
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  BookOpen,
  Brain,
  Zap,
  ChevronRight,
  Target,
  Headphones,
  Mic,
  BookMarked,
  TrendingUp,
  Calendar,
  Star,
  Play,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore, useProgressStore, useLessonStore } from '@/store'
import { getGreeting, formatNumber } from '@/lib/utils'

// ========================
// Sub-components
// ========================

/** Circular progress ring */
function CircularProgress({
  percent,
  size = 80,
  strokeWidth = 8,
  children,
}: {
  percent: number
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(99,102,241,0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

/** Card học nhanh (2x2 grid) */
function QuickCard({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType
  label: string
  color: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-2xl',
        'bg-gray-800/60 border border-gray-700/50',
        'hover:border-indigo-500/50 hover:bg-gray-800',
        'transition-all duration-200 active:scale-95 w-full'
      )}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-semibold text-gray-300">{label}</span>
    </button>
  )
}

/** Stat card nhỏ */
function StatCard({
  icon: Icon,
  value,
  label,
  gradient,
}: {
  icon: React.ElementType
  value: string | number
  label: string
  gradient: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-800/60 border border-gray-700/40 flex-1">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', gradient)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-lg font-black text-white">{value}</span>
      <span className="text-[10px] text-gray-400 text-center leading-tight">{label}</span>
    </div>
  )
}

// ========================
// Dashboard chính
// ========================
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { progress, todayActivity } = useProgressStore()
  const { dueCardsCount, currentPhase, currentWeek } = useLessonStore()

  // Tính % mục tiêu hàng ngày (phút học / mục tiêu)
  const dailyGoal = user?.dailyGoalMinutes ?? 20
  const minutesToday = todayActivity
    ? todayActivity.listeningMinutes + todayActivity.speakingMinutes
    : 0
  const goalPercent = Math.min(100, Math.round((minutesToday / dailyGoal) * 100))

  // XP hôm nay
  const xpToday = todayActivity?.xpEarned ?? 0

  // Phase label
  const phaseLabels: Record<string, string> = {
    PHASE_0: 'A0 · Làm quen',
    PHASE_1: 'A1 · Cơ bản',
    PHASE_2: 'A2 · Trung cấp',
    PHASE_3: 'B1 · Khá',
  }

  // IELTS ước tính
  const ieltsEst = progress?.estimatedIELTS?.toFixed(1) ?? '—'

  // Activity feed 3 ngày gần đây (mock nếu chưa có data)
  const recentDays = [
    { label: 'Hôm qua', xp: 45, done: true },
    { label: '2 ngày trước', xp: 60, done: true },
    { label: '3 ngày trước', xp: 30, done: true },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* ── Header / Greeting ── */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 px-5 pt-12 pb-6">
        <p className="text-gray-400 text-sm mb-1">
          {getGreeting().replace(' 👋', '')}
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              {user?.name ?? 'Bạn'}{' '}
              <span className="wave inline-block">👋</span>
            </h1>
            <p className="text-indigo-400 text-sm font-medium mt-0.5">
              {phaseLabels[currentPhase]} · Tuần {currentWeek}
            </p>
          </div>

          {/* IELTS Badge */}
          <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Star className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-lg font-black text-amber-400">{ieltsEst}</span>
            <span className="text-[9px] text-amber-400/70 font-semibold">IELTS est.</span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* ── Mục tiêu hàng ngày + Streak ── */}
        <div className="flex gap-4">
          {/* Circular goal progress */}
          <div className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 flex items-center gap-4">
            <CircularProgress percent={goalPercent} size={72} strokeWidth={7}>
              <span className="text-sm font-black text-white">{goalPercent}%</span>
            </CircularProgress>
            <div>
              <p className="text-xs text-gray-400 mb-1">Mục tiêu hôm nay</p>
              <p className="text-base font-bold text-white">
                {minutesToday}/{dailyGoal} phút
              </p>
              <div className="mt-1.5 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 min-w-[90px]">
            <Flame
              className={cn(
                'w-8 h-8',
                (progress?.currentStreak ?? 0) > 0
                  ? 'text-orange-400 animate-[pulse_1.5s_ease-in-out_infinite]'
                  : 'text-gray-500'
              )}
            />
            <span className="text-2xl font-black text-white">
              {progress?.currentStreak ?? 0}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">ngày liên tục</span>
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div className="flex gap-3">
          <StatCard
            icon={BookOpen}
            value={formatNumber(progress?.vocabularyCount ?? 0)}
            label="Từ đã học"
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={Brain}
            value={progress?.grammarLessonsCompleted ?? 0}
            label="Bài ngữ pháp"
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <StatCard
            icon={Zap}
            value={xpToday}
            label="XP hôm nay"
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          />
        </div>

        {/* ── Bài học hôm nay ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Bài học hôm nay
          </h2>
          <button
            onClick={() => navigate('/lesson/today')}
            className={cn(
              'w-full text-left rounded-2xl overflow-hidden',
              'bg-gradient-to-br from-indigo-900/80 via-purple-900/60 to-gray-900',
              'border border-indigo-500/30',
              'hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10',
              'transition-all duration-200 active:scale-[0.98]'
            )}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-full mb-2">
                    <Calendar className="w-3 h-3" />
                    TUẦN {currentWeek}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Bài học ngày {new Date().getDate()}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    10 từ mới · 1 ngữ pháp · Luyện nghe
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <BookMarked className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              {/* Tiến độ bài học */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-2 bg-gray-700/60 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                </div>
                <span className="text-xs text-gray-400">0/4</span>
              </div>

              {/* Nút bắt đầu */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~20 phút</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
                  <Play className="w-4 h-4" />
                  Bắt đầu
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* ── SRS Ôn tập ── */}
        {dueCardsCount > 0 && (
          <button
            onClick={() => navigate('/vocabulary')}
            className={cn(
              'w-full text-left p-4 rounded-2xl',
              'bg-gradient-to-r from-amber-900/40 to-orange-900/30',
              'border border-amber-500/30',
              'hover:border-amber-500/60 transition-all duration-200 active:scale-[0.98]',
              'flex items-center gap-4'
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-amber-400/70 font-semibold mb-0.5">SRS ÔN TẬP</p>
              <p className="text-white font-bold">
                {dueCardsCount} thẻ cần ôn hôm nay
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Đừng để quên nhé!</p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400/60" />
          </button>
        )}

        {/* ── Quick Access 2x2 ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Luyện tập nhanh
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickCard
              icon={BookOpen}
              label="Ngữ pháp"
              color="bg-gradient-to-br from-blue-500 to-indigo-600"
              onClick={() => navigate('/grammar')}
            />
            <QuickCard
              icon={Headphones}
              label="Nghe"
              color="bg-gradient-to-br from-teal-500 to-cyan-600"
              onClick={() => navigate('/listening')}
            />
            <QuickCard
              icon={Mic}
              label="Nói"
              color="bg-gradient-to-br from-pink-500 to-rose-600"
              onClick={() => navigate('/speaking')}
            />
            <QuickCard
              icon={BookMarked}
              label="Đọc"
              color="bg-gradient-to-br from-amber-500 to-orange-500"
              onClick={() => navigate('/reading-writing')}
            />
          </div>
        </div>

        {/* ── Hoạt động gần đây ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Hoạt động gần đây
            </h2>
            <button
              onClick={() => navigate('/progress')}
              className="text-xs text-indigo-400 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentDays.map((day, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/30"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    day.done
                      ? 'bg-green-500/20'
                      : 'bg-gray-700/50'
                  )}
                >
                  {day.done ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <Target className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{day.label}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold">{day.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tiến độ lộ trình ── */}
        <button
          onClick={() => navigate('/roadmap')}
          className={cn(
            'w-full text-left p-4 rounded-2xl',
            'bg-gray-800/60 border border-gray-700/50',
            'hover:border-indigo-500/40 transition-all duration-200 active:scale-[0.98]',
            'flex items-center gap-4'
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-semibold mb-0.5">LỘ TRÌNH HỌC</p>
            <p className="text-white font-bold">Xem toàn bộ lộ trình A0 → B1</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {phaseLabels[currentPhase]}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  )
}
