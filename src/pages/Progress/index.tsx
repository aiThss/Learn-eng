/**
 * Progress & Statistics Page
 * Shows only learner data recorded on this device. This app does not yet run
 * a calibrated IELTS/TOEIC test, so it deliberately does not invent scores.
 */
import { Award, Flame, Zap, BookOpen, Mic, FileText, CheckCircle2 } from 'lucide-react'
import { useProgressStore } from '@/store'

export default function ProgressPage() {
  const { progress } = useProgressStore()

  const vocabCount = progress?.vocabularyCount ?? 0
  const grammarCount = progress?.grammarLessonsCompleted ?? 0
  const speakingMinutes = progress?.speakingMinutes ?? 0
  const listeningMinutes = progress?.listeningMinutes ?? 0
  const streak = progress?.currentStreak ?? 0
  const xp = progress?.totalXP ?? 0
  const studyMinutes = progress?.totalStudyMinutes ?? 0
  const completedDays = progress?.completedDays ?? 0

  const skills = [
    { name: 'Từ vựng', count: `${vocabCount} từ đã học`, icon: BookOpen },
    { name: 'Ngữ pháp', count: `${grammarCount} bài đã hoàn thành`, icon: FileText },
    { name: 'Luyện nói', count: `${speakingMinutes} phút đã ghi nhận`, icon: Mic },
    { name: 'Luyện nghe', count: `${listeningMinutes} phút đã ghi nhận`, icon: CheckCircle2 },
  ]

  const badges = [
    { title: 'Khởi đầu rực rỡ', desc: 'Ghi nhận ngày học đầu tiên', icon: '🚀', unlocked: completedDays >= 1 },
    { title: 'Streak 7 ngày', desc: 'Học liên tục 7 ngày', icon: '🔥', unlocked: streak >= 7 },
    { title: 'Chiến binh 100 từ', desc: 'Học 100 từ vựng', icon: '⭐', unlocked: vocabCount >= 100 },
  ]

  return (
    <div className="min-h-screen space-y-5 bg-background p-4 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-200">Tiến độ được ghi nhận</p>
        <p className="mt-2 text-3xl font-black">{completedDays} ngày học</p>
        <p className="mt-4 text-xs text-brand-100">
          EnglishUp chưa có bài thi chuẩn hóa, nên không tự gán điểm IELTS hoặc TOEIC.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <Flame className="mx-auto mb-1 h-6 w-6 text-orange-500" />
          <p className="text-lg font-bold">{streak} ngày</p>
          <p className="text-[11px] text-muted-foreground">Streak hiện tại</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <Zap className="mx-auto mb-1 h-6 w-6 text-yellow-500" />
          <p className="text-lg font-bold">{xp}</p>
          <p className="text-[11px] text-muted-foreground">Tổng điểm XP</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <Award className="mx-auto mb-1 h-6 w-6 text-indigo-500" />
          <p className="text-lg font-bold">{studyMinutes}p</p>
          <p className="text-[11px] text-muted-foreground">Thời gian học</p>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
        <h3 className="text-base font-bold">Hoạt động theo kỹ năng</h3>
        {skills.map((skill) => (
          <div key={skill.name} className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <skill.icon size={16} className="text-muted-foreground" />
              {skill.name}
            </span>
            <span className="text-muted-foreground">{skill.count}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h3 className="text-base font-bold">Huy hiệu thành tích</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                badge.unlocked ? 'border-border bg-accent/40' : 'border-border/50 bg-muted/20 opacity-50'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <p className="text-xs font-bold leading-tight">{badge.title}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
