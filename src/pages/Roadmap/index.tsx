/**
 * Roadmap - Trang lộ trình học A0 → B1
 * Hiển thị 4 giai đoạn học tập với timeline dọc
 */
import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Lock,
  Star,
  BookOpen,
  Zap,
  Target,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore, useLessonStore } from '@/store'
import type { LearningPhase } from '@/types'

// ========================
// Dữ liệu lộ trình
// ========================
interface WeekInfo {
  week: number
  title: string
  vocab: string
  grammar: string
  skills: string[]
}

interface PhaseData {
  id: LearningPhase
  level: string
  name: string
  duration: string
  weeks: number
  description: string
  ieltsRange: string
  color: string
  gradient: string
  icon: string
  weekPlans: WeekInfo[]
}

const PHASES: PhaseData[] = [
  {
    id: 'PHASE_0',
    level: 'A0',
    name: 'Làm quen',
    duration: '2 tuần',
    weeks: 2,
    description: 'Bắt đầu từ con số 0, làm quen với 26 chữ cái, phát âm cơ bản và 200 từ vựng thiết yếu.',
    ieltsRange: 'Chưa có',
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-600',
    icon: '🌱',
    weekPlans: [
      {
        week: 1,
        title: 'Bảng chữ cái & phát âm',
        vocab: '100 từ cơ bản nhất',
        grammar: 'To be (am/is/are)',
        skills: ['Đọc từ đơn', 'Nghe phát âm', 'Viết chữ thường/hoa'],
      },
      {
        week: 2,
        title: 'Số đếm, màu sắc & chào hỏi',
        vocab: '100 từ chủ đề hàng ngày',
        grammar: 'This/That, These/Those',
        skills: ['Giới thiệu bản thân', 'Nghe hội thoại ngắn', 'Viết câu đơn giản'],
      },
    ],
  },
  {
    id: 'PHASE_1',
    level: 'A1',
    name: 'Cơ bản',
    duration: '6 tuần',
    weeks: 6,
    description: 'Xây dựng nền tảng vững chắc với 800 từ vựng, ngữ pháp cơ bản và giao tiếp đơn giản.',
    ieltsRange: '2.0 – 3.0',
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-indigo-600',
    icon: '📚',
    weekPlans: [
      {
        week: 3,
        title: 'Thì hiện tại đơn',
        vocab: '150 từ chủ đề gia đình, công việc',
        grammar: 'Simple Present + adverbs of frequency',
        skills: ['Nói về thói quen', 'Đọc đoạn văn ngắn', 'Viết đoạn giới thiệu'],
      },
      {
        week: 4,
        title: 'Thì hiện tại tiếp diễn',
        vocab: '150 từ hành động, trạng thái',
        grammar: 'Present Continuous vs Simple Present',
        skills: ['Mô tả hành động đang diễn ra', 'Hội thoại ngắn', 'Viết nhật ký'],
      },
      {
        week: 5,
        title: 'Thì quá khứ đơn',
        vocab: '150 từ thời gian, cảm xúc',
        grammar: 'Simple Past (regular & irregular verbs)',
        skills: ['Kể chuyện đơn giản', 'Nghe bản tin ngắn', 'Viết câu về quá khứ'],
      },
      {
        week: 6,
        title: 'Câu hỏi & phủ định',
        vocab: '150 từ câu hỏi, từ nối',
        grammar: 'Question forms, negatives, short answers',
        skills: ['Phỏng vấn ngắn', 'Đọc Q&A', 'Viết hộp thư hỏi đáp'],
      },
      {
        week: 7,
        title: 'Tính từ & Trạng từ',
        vocab: '100 tính từ thông dụng',
        grammar: 'Adjectives, comparatives, superlatives',
        skills: ['Mô tả người và vật', 'Nghe mô tả', 'Viết mô tả đơn giản'],
      },
      {
        week: 8,
        title: 'Ôn tập & Mini Test A1',
        vocab: 'Ôn 800 từ + flash cards SRS',
        grammar: 'Tổng ôn toàn bộ A1',
        skills: ['Mini test 40 câu', 'Hội thoại 2 phút', 'Đọc bài 200 từ'],
      },
    ],
  },
  {
    id: 'PHASE_2',
    level: 'A2',
    name: 'Trung cấp',
    duration: '8 tuần',
    weeks: 8,
    description: 'Nâng cao vốn từ lên 2.000 từ, ngữ pháp phong phú và bắt đầu nghe/đọc tài liệu thực.',
    ieltsRange: '3.0 – 4.5',
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-purple-600',
    icon: '🚀',
    weekPlans: [
      {
        week: 9,
        title: 'Thì tương lai & Điều kiện loại 1',
        vocab: '200 từ kế hoạch, tương lai',
        grammar: 'will/going to, First conditional',
        skills: ['Nói về kế hoạch', 'Nghe dự báo thời tiết', 'Viết email kế hoạch'],
      },
      {
        week: 10,
        title: 'Thì hoàn thành',
        vocab: '200 từ kinh nghiệm, thành tựu',
        grammar: 'Present Perfect vs Past Simple',
        skills: ['Kể kinh nghiệm sống', 'Nghe phỏng vấn', 'Viết CV đơn giản'],
      },
      {
        week: 11,
        title: 'Modal verbs',
        vocab: '150 từ khả năng, bổn phận',
        grammar: 'can/could/should/must/might/would',
        skills: ['Lời khuyên, yêu cầu', 'Nghe hội thoại công sở', 'Viết email xin phép'],
      },
      {
        week: 12,
        title: 'Câu bị động',
        vocab: '150 từ kỹ thuật, sản xuất',
        grammar: 'Passive voice (present, past, future)',
        skills: ['Mô tả quy trình', 'Đọc bài khoa học', 'Viết thông báo'],
      },
      {
        week: 13,
        title: 'Mệnh đề quan hệ',
        vocab: '150 từ mô tả, kết nối',
        grammar: 'Relative clauses (who, which, that, where)',
        skills: ['Giải thích định nghĩa', 'Đọc bách khoa toàn thư', 'Viết đoạn mô tả'],
      },
      {
        week: 14,
        title: 'Ngữ cảnh: Du lịch & Công sở',
        vocab: '200 từ chủ đề du lịch',
        grammar: 'Indirect speech, requests & suggestions',
        skills: ['Hội thoại đặt phòng', 'Nghe hướng dẫn du lịch', 'Viết đánh giá khách sạn'],
      },
      {
        week: 15,
        title: 'Ngữ cảnh: Sức khỏe & Môi trường',
        vocab: '150 từ y tế, môi trường',
        grammar: 'Second conditional, wish clauses',
        skills: ['Trình bày vấn đề', 'Nghe bài nói về môi trường', 'Viết luận điểm ngắn'],
      },
      {
        week: 16,
        title: 'Ôn tập & Mock Test A2',
        vocab: 'Ôn 2000 từ + SRS intensive',
        grammar: 'Tổng ôn toàn bộ A2',
        skills: ['Mock test 60 câu', 'Hội thoại 5 phút', 'Đọc bài 400 từ'],
      },
    ],
  },
  {
    id: 'PHASE_3',
    level: 'B1',
    name: 'Khá',
    duration: '12 tuần',
    weeks: 12,
    description: 'Đạt trình độ B1 với 3.500+ từ vựng, tư duy độc lập bằng tiếng Anh và ước tính IELTS 4.5–5.5.',
    ieltsRange: '4.5 – 5.5',
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-600',
    icon: '🏆',
    weekPlans: [
      {
        week: 17,
        title: 'Cụm động từ thông dụng',
        vocab: '200 phrasal verbs quan trọng nhất',
        grammar: 'Phrasal verbs in context',
        skills: ['Hội thoại tự nhiên', 'Nghe podcast đơn giản', 'Viết luận điểm'],
      },
      {
        week: 18,
        title: 'Liên từ & Cohesion',
        vocab: '100 từ nối nâng cao',
        grammar: 'Discourse markers, linking words',
        skills: ['Nói trôi chảy hơn', 'Đọc bài báo', 'Viết paragraph có cohesion'],
      },
      {
        week: 19,
        title: 'IELTS Vocabulary: Topic 1-4',
        vocab: '300 từ IELTS: Education, Technology',
        grammar: 'Nominalisation',
        skills: ['IELTS Speaking Part 1&2', 'Nghe IELTS Section 1&2', 'Writing Task 1'],
      },
      {
        week: 20,
        title: 'IELTS Vocabulary: Topic 5-8',
        vocab: '300 từ IELTS: Environment, Health',
        grammar: 'Cleft sentences, emphatic structures',
        skills: ['IELTS Speaking Part 3', 'Nghe IELTS Section 3&4', 'Writing Task 2 intro'],
      },
    ],
  },
]

// ========================
// Phase Card Component
// ========================
function PhaseCard({
  phase,
  isActive,
  isCompleted,
  isLocked,
  isExpanded,
  onToggle,
  currentWeek,
}: {
  phase: PhaseData
  isActive: boolean
  isCompleted: boolean
  isLocked: boolean
  isExpanded: boolean
  onToggle: () => void
  currentWeek: number
}) {
  return (
    <div className="relative">
      {/* Timeline connector phía trên */}
      <div
        className={cn(
          'absolute left-6 -top-5 w-0.5 h-5',
          isCompleted ? 'bg-green-500' : 'bg-gray-700'
        )}
      />

      {/* Phase header */}
      <button
        onClick={!isLocked ? onToggle : undefined}
        disabled={isLocked}
        className={cn(
          'w-full text-left rounded-2xl border transition-all duration-300',
          isActive && 'border-indigo-500/50 shadow-lg shadow-indigo-500/10',
          isCompleted && !isActive && 'border-green-500/30',
          !isActive && !isCompleted && !isLocked && 'border-gray-700/50',
          isLocked && 'border-gray-800 opacity-60 cursor-not-allowed',
          'overflow-hidden'
        )}
      >
        <div
          className={cn(
            'p-4',
            isActive
              ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/40'
              : isCompleted
              ? 'bg-green-900/20'
              : isLocked
              ? 'bg-gray-900/40'
              : 'bg-gray-800/50'
          )}
        >
          <div className="flex items-center gap-4">
            {/* Phase icon với số */}
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-xl',
                  isCompleted
                    ? 'bg-green-500/20'
                    : isActive
                    ? `bg-gradient-to-br ${phase.gradient} opacity-90`
                    : isLocked
                    ? 'bg-gray-800'
                    : 'bg-gray-700/60'
                )}
              >
                {isLocked ? (
                  <Lock className="w-5 h-5 text-gray-500" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <span>{phase.icon}</span>
                )}
              </div>
              {/* Level badge */}
              <div
                className={cn(
                  'absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-md',
                  isActive
                    ? 'bg-indigo-500 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                )}
              >
                {phase.level}
              </div>
            </div>

            {/* Phase info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'font-black text-base',
                    isActive ? 'text-white' : isLocked ? 'text-gray-500' : 'text-gray-200'
                  )}
                >
                  {phase.name}
                </h3>
                {isActive && (
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    ĐANG HỌC
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {phase.duration}
                </span>
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  IELTS {phase.ieltsRange}
                </span>
              </div>
            </div>

            {/* Expand button */}
            {!isLocked && (
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            )}
          </div>

          {/* Mô tả ngắn */}
          {!isExpanded && (
            <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
              {phase.description}
            </p>
          )}
        </div>

        {/* Expanded week cards */}
        {isExpanded && !isLocked && (
          <div className="border-t border-gray-700/40 p-4 space-y-3 bg-gray-900/30">
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              {phase.description}
            </p>
            {phase.weekPlans.map((week) => {
              const isWeekDone = week.week < currentWeek
              const isCurrentWeek = week.week === currentWeek

              return (
                <div
                  key={week.week}
                  className={cn(
                    'rounded-xl border p-3',
                    isCurrentWeek
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : isWeekDone
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-gray-700/30 bg-gray-800/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Week status icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {isWeekDone ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : isCurrentWeek ? (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      ) : (
                        <Circle className="w-4 h-4 text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500">
                          TUẦN {week.week}
                        </span>
                        {isCurrentWeek && (
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                            HIỆN TẠI
                          </span>
                        )}
                      </div>
                      <h4
                        className={cn(
                          'font-bold text-sm mt-0.5',
                          isCurrentWeek ? 'text-white' : 'text-gray-300'
                        )}
                      >
                        {week.title}
                      </h4>

                      {/* Week details */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-[11px] text-gray-400">{week.vocab}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Zap className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span className="text-[11px] text-gray-400">{week.grammar}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {week.skills.map((skill, si) => (
                            <span
                              key={si}
                              className="text-[10px] bg-gray-700/60 text-gray-400 px-2 py-0.5 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </button>
    </div>
  )
}

// ========================
// Roadmap page chính
// ========================
export default function Roadmap() {
  const { user } = useUserStore()
  const { currentPhase, currentWeek } = useLessonStore()

  const [expandedPhase, setExpandedPhase] = useState<LearningPhase | null>(currentPhase)

  // Tính index phase hiện tại
  const phaseOrder: LearningPhase[] = ['PHASE_0', 'PHASE_1', 'PHASE_2', 'PHASE_3']
  const currentPhaseIdx = phaseOrder.indexOf(currentPhase)

  // Tính tổng % tiến độ toàn lộ trình
  const totalWeeks = PHASES.reduce((s, p) => s + p.weeks, 0) // 28
  const progressPercent = Math.round(((currentWeek - 1) / totalWeeks) * 100)

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* ── Header ── */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 px-5 pt-12 pb-6">
        <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          Lộ trình học tập
        </p>
        <h1 className="text-2xl font-black text-white mb-1">A0 → B1</h1>
        <p className="text-gray-400 text-sm">
          {user?.name ? `${user.name} đang ở` : 'Bạn đang ở'}{' '}
          <span className="text-indigo-400 font-semibold">
            {PHASES.find((p) => p.id === currentPhase)?.level ?? 'A0'}
          </span>{' '}
          · Tuần {currentWeek}/{totalWeeks}
        </p>

        {/* Progress bar toàn lộ trình */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>A0</span>
            <span className="text-indigo-400 font-bold">{progressPercent}% hoàn thành</span>
            <span>B1</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Phase markers */}
          <div className="flex justify-between mt-1.5">
            {PHASES.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'text-[10px] font-bold',
                  p.id === currentPhase ? 'text-indigo-400' : 'text-gray-600'
                )}
              >
                {p.level}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="px-5 pt-2 space-y-5">
        {/* Stats tổng quan */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-white">{totalWeeks}</p>
            <p className="text-[10px] text-gray-400">tổng tuần</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-indigo-400">{currentWeek}</p>
            <p className="text-[10px] text-gray-400">tuần hiện tại</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-3 text-center">
            <p className="text-xl font-black text-amber-400">5.0</p>
            <p className="text-[10px] text-gray-400">mục tiêu IELTS</p>
          </div>
        </div>

        {/* Phase cards với timeline */}
        <div className="relative">
          {/* Đường timeline dọc */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800" />

          <div className="space-y-5">
            {PHASES.map((phase, idx) => {
              const isCompleted = idx < currentPhaseIdx
              const isActive = phase.id === currentPhase
              const isLocked = idx > currentPhaseIdx

              return (
                <div key={phase.id} className="relative">
                  {/* Dot trên timeline */}
                  <div
                    className={cn(
                      'absolute left-4 top-6 w-4 h-4 rounded-full z-10 border-2',
                      isCompleted
                        ? 'bg-green-500 border-green-400'
                        : isActive
                        ? 'bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/40'
                        : 'bg-gray-800 border-gray-600'
                    )}
                  />

                  {/* Card offset để nhường chỗ dot */}
                  <div className="ml-10">
                    <PhaseCard
                      phase={phase}
                      isActive={isActive}
                      isCompleted={isCompleted}
                      isLocked={isLocked}
                      isExpanded={expandedPhase === phase.id}
                      onToggle={() =>
                        setExpandedPhase(expandedPhase === phase.id ? null : phase.id)
                      }
                      currentWeek={currentWeek}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mục tiêu cuối */}
          <div className="relative ml-10 mt-5">
            <div className="absolute -left-6 top-6 w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-400 z-10" />
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/30">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="font-black text-white text-sm">Đích đến: IELTS 4.5–5.5</p>
                <p className="text-xs text-amber-400/80 mt-0.5">Sau 28 tuần kiên trì</p>
              </div>
              <Target className="w-5 h-5 text-amber-400 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
