/**
 * Progress & Statistics Page
 * Hiển thị dự đoán IELTS/TOEIC, heatmap 7 ngày, skill breakdown, thành tích
 */
import { Award, Flame, Zap, BookOpen, Mic, FileText, CheckCircle2, TrendingUp } from 'lucide-react'
import { useProgressStore, useUserStore } from '@/store'
import { estimateIELTS } from '@/lib/utils'

export default function ProgressPage() {
  const { progress } = useProgressStore()
  const { user } = useUserStore()

  const vocabCount = progress?.vocabularyCount ?? 45
  const grammarCount = progress?.grammarLessonsCompleted ?? 6
  const streak = progress?.currentStreak ?? 5
  const xp = progress?.totalXP ?? 420
  const studyMinutes = progress?.totalStudyMinutes ?? 125

  const estimatedIELTS = estimateIELTS(vocabCount, grammarCount, [70, 80, 75])
  const estimatedTOEIC = Math.round(estimatedIELTS * 110 + 50)

  const skills = [
    { name: 'Từ vựng', count: `${vocabCount}/3500 từ`, pct: Math.min(100, Math.round((vocabCount / 3500) * 100)), icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Ngữ pháp', count: `${grammarCount}/50 bài`, pct: Math.min(100, Math.round((grammarCount / 50) * 100)), icon: FileText, color: 'bg-purple-500' },
    { name: 'Luyện nói', count: '12 phút', pct: 35, icon: Mic, color: 'bg-pink-500' },
    { name: 'Luyện nghe', count: '25 phút', pct: 50, icon: CheckCircle2, color: 'bg-green-500' },
  ]

  const badges = [
    { title: 'Khởi đầu rực rỡ', desc: 'Hoàn thành bài học đầu tiên', icon: '🚀', unlocked: true },
    { title: 'Streak 7 ngày', desc: 'Học liên tục 7 ngày', icon: '🔥', unlocked: streak >= 7 },
    { title: 'Chiến binh 100 từ', desc: 'Thu phục 100 từ vựng', icon: '⭐', unlocked: vocabCount >= 100 },
    { title: 'Bậc thầy AI', desc: 'Trò chuyện với AI Tutor 10 lần', icon: '🤖', unlocked: true },
  ]

  return (
    <div className="min-h-screen p-4 pb-20 space-y-5 bg-background">
      {/* Header score estimate */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-xs uppercase tracking-wider font-bold text-brand-200 mb-1">
          Dự đoán trình độ hiện tại
        </p>
        <div className="flex items-baseline gap-4 mt-2">
          <div>
            <span className="text-4xl font-black">{estimatedIELTS.toFixed(1)}</span>
            <span className="text-sm font-semibold ml-1 text-brand-200">IELTS</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <span className="text-3xl font-bold">{estimatedTOEIC}</span>
            <span className="text-sm font-semibold ml-1 text-brand-200">TOEIC</span>
          </div>
        </div>
        <p className="text-xs text-brand-100 mt-4 flex items-center gap-1">
          <TrendingUp size={14} /> Dựa trên SRS, từ vựng mastered và điểm bài tập
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border p-4 rounded-2xl text-center">
          <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{streak} ngày</p>
          <p className="text-[11px] text-muted-foreground">Streak hiện tại</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl text-center">
          <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{xp}</p>
          <p className="text-[11px] text-muted-foreground">Tổng điểm XP</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl text-center">
          <Award className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{studyMinutes}p</p>
          <p className="text-[11px] text-muted-foreground">Thời gian học</p>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="bg-card border border-border p-5 rounded-3xl space-y-4">
        <h3 className="font-bold text-base">Tiến độ kỹ năng</h3>
        {skills.map((s) => (
          <div key={s.name} className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <s.icon size={14} className="text-muted-foreground" /> {s.name}
              </span>
              <span className="text-muted-foreground">{s.count}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Badges / Achievements */}
      <div className="bg-card border border-border p-5 rounded-3xl space-y-3">
        <h3 className="font-bold text-base">Huy hiệu thành tích</h3>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.title}
              className={`p-3 rounded-2xl border flex items-center gap-3 ${
                b.unlocked ? 'bg-accent/40 border-border' : 'opacity-50 border-border/50 bg-muted/20'
              }`}
            >
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-xs font-bold leading-tight">{b.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
