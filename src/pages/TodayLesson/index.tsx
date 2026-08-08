/**
 * TodayLesson - Trang bài học hôm nay
 * Bao gồm 4 tab: Từ vựng, Ngữ pháp, Nghe, Luyện tập
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Zap,
  Headphones,
  Target,
  ChevronLeft,
  Volume2,
  CheckCircle2,
  Circle,
  Play,
  Lock,
  Star,
  ChevronRight,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgressStore, useLessonStore } from '@/store'

// ========================
// Dữ liệu mock bài học
// ========================
const MOCK_VOCAB = [
  { word: 'beautiful', pronunciation: '/ˈbjuːtɪfl/', meaning: 'đẹp, xinh đẹp', example: 'She has a beautiful smile.' },
  { word: 'important', pronunciation: '/ɪmˈpɔːtnt/', meaning: 'quan trọng', example: 'This is an important decision.' },
  { word: 'difficult', pronunciation: '/ˈdɪfɪkəlt/', meaning: 'khó, khó khăn', example: 'The exam was very difficult.' },
  { word: 'remember', pronunciation: '/rɪˈmembə(r)/', meaning: 'nhớ, ghi nhớ', example: 'I can\'t remember his name.' },
  { word: 'experience', pronunciation: '/ɪkˈspɪəriəns/', meaning: 'kinh nghiệm; trải qua', example: 'She has 5 years of experience.' },
  { word: 'government', pronunciation: '/ˈɡʌvənmənt/', meaning: 'chính phủ', example: 'The government made a new law.' },
  { word: 'environment', pronunciation: '/ɪnˈvaɪrənmənt/', meaning: 'môi trường', example: 'We must protect the environment.' },
  { word: 'opportunity', pronunciation: '/ˌɒpəˈtjuːnɪti/', meaning: 'cơ hội', example: 'This is a great opportunity.' },
  { word: 'communicate', pronunciation: '/kəˈmjuːnɪkeɪt/', meaning: 'giao tiếp, truyền đạt', example: 'It\'s important to communicate clearly.' },
  { word: 'understand', pronunciation: '/ˌʌndəˈstænd/', meaning: 'hiểu, thấu hiểu', example: 'Do you understand the question?' },
]

const MOCK_GRAMMAR = {
  title: 'Present Perfect',
  titleVi: 'Thì Hiện tại hoàn thành',
  structure: 'S + have/has + V(past participle)',
  explanation: 'Present Perfect là thì nối quá khứ với hiện tại.',
  explanationVi:
    'Dùng Present Perfect khi muốn nói về hành động đã xảy ra trong quá khứ nhưng có liên quan đến hiện tại, hoặc khi không nêu rõ thời điểm cụ thể.',
  uses: [
    { label: 'Kinh nghiệm sống', example: 'I have visited Paris three times.', vi: 'Tôi đã thăm Paris 3 lần.' },
    { label: 'Hành động vừa xong', example: 'She has just finished her homework.', vi: 'Cô ấy vừa mới làm xong bài tập.' },
    { label: 'Kết quả còn hiệu lực', example: 'He has lost his keys.', vi: 'Anh ấy đã mất chìa khóa (và vẫn chưa tìm thấy).' },
  ],
  keywords: ['already, yet, just, ever, never, since, for, recently'],
}

const MOCK_EXERCISES = [
  {
    id: 'e1',
    question: 'She _____ to Paris three times.',
    options: ['went', 'has gone', 'goes', 'had gone'],
    correct: 1,
    explanation: 'Dùng Present Perfect vì nói về kinh nghiệm (số lần).',
  },
  {
    id: 'e2',
    question: 'I _____ this movie before. It\'s great!',
    options: ['see', 'saw', 'have seen', 'had seen'],
    correct: 2,
    explanation: 'Present Perfect dùng cho kinh nghiệm trong quá khứ không xác định thời điểm.',
  },
  {
    id: 'e3',
    question: 'They _____ their homework yet.',
    options: ['haven\'t finished', 'didn\'t finish', 'don\'t finish', 'hadn\'t finished'],
    correct: 0,
    explanation: '"yet" dùng trong câu phủ định với Present Perfect.',
  },
  {
    id: 'e4',
    question: 'He has _____ eaten lunch.',
    options: ['yet', 'already', 'since', 'ago'],
    correct: 1,
    explanation: '"already" dùng trong câu khẳng định với Present Perfect.',
  },
  {
    id: 'e5',
    question: 'We _____ here since 2020.',
    options: ['live', 'lived', 'have lived', 'are living'],
    correct: 2,
    explanation: '"since" + thời điểm cụ thể dùng với Present Perfect.',
  },
]

// ========================
// Tab types
// ========================
type TabKey = 'vocabulary' | 'grammar' | 'listening' | 'practice'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'vocabulary', label: 'Từ vựng', icon: BookOpen },
  { key: 'grammar', label: 'Ngữ pháp', icon: Zap },
  { key: 'listening', label: 'Nghe', icon: Headphones },
  { key: 'practice', label: 'Luyện tập', icon: Target },
]

// ========================
// Tab Content Components
// ========================

/** Vocabulary tab */
function VocabTab({ isUnlocked }: { isUnlocked: boolean }) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)

  if (!isUnlocked) return <LockedTab />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-white">10 từ mới hôm nay</h3>
        <button className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-xl active:scale-95 transition-transform">
          <Play className="w-4 h-4" />
          Học tất cả
        </button>
      </div>

      {MOCK_VOCAB.map((item, i) => (
        <div
          key={i}
          className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-white">{item.word}</span>
                <span className="text-xs text-gray-500 font-mono">{item.pronunciation}</span>
              </div>
              <p className="text-sm text-indigo-400 font-semibold mt-0.5">{item.meaning}</p>
              <p className="text-xs text-gray-400 mt-1.5 italic">"{item.example}"</p>
            </div>
            <button
              onClick={() => setPlayingIdx(playingIdx === i ? null : i)}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                playingIdx === i
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-700/60 text-gray-400 hover:bg-gray-700'
              )}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Grammar tab */
function GrammarTab({ isUnlocked }: { isUnlocked: boolean }) {
  if (!isUnlocked) return <LockedTab />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
          Ngữ pháp hôm nay
        </span>
        <h3 className="text-xl font-black text-white mt-1">{MOCK_GRAMMAR.titleVi}</h3>
        <code className="inline-block mt-2 px-3 py-1.5 bg-gray-900/60 rounded-lg text-sm font-mono text-indigo-300 border border-indigo-500/20">
          {MOCK_GRAMMAR.structure}
        </code>
      </div>

      {/* Giải thích */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-2">📖 Giải thích</h4>
        <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 border border-gray-700/30 rounded-xl p-4">
          {MOCK_GRAMMAR.explanationVi}
        </p>
      </div>

      {/* Cách dùng */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-3">🎯 Cách dùng</h4>
        <div className="space-y-3">
          {MOCK_GRAMMAR.uses.map((use, i) => (
            <div
              key={i}
              className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-4"
            >
              <span className="inline-block text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded mb-2">
                {use.label}
              </span>
              <p className="text-sm font-semibold text-white mb-1">"{use.example}"</p>
              <p className="text-xs text-gray-400 italic">→ {use.vi}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Từ khóa */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-2">🔑 Từ khóa nhận biết</h4>
        <div className="flex flex-wrap gap-2">
          {MOCK_GRAMMAR.keywords[0].split(', ').map((kw, i) => (
            <span
              key={i}
              className="text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Listening tab */
function ListeningTab({ isUnlocked }: { isUnlocked: boolean }) {
  const [playing, setPlaying] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  if (!isUnlocked) return <LockedTab />

  const questions = [
    {
      q: 'What is the main topic of the audio?',
      options: ['Travel plans', 'Work schedule', 'Study habits', 'Weekend activities'],
      correct: 2,
    },
    {
      q: 'How long does the speaker study each day?',
      options: ['1 hour', '2 hours', '3 hours', '30 minutes'],
      correct: 1,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Audio player */}
      <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/20 border border-teal-500/30 rounded-2xl p-5">
        <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
          Audio · 2 phút 30 giây
        </p>
        <h3 className="text-base font-black text-white mb-4">
          "My Daily Study Routine"
        </h3>

        {/* Thanh audio giả */}
        <div className="h-1.5 bg-gray-700/60 rounded-full mb-4 overflow-hidden">
          <div
            className={cn(
              'h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300',
              playing ? 'w-1/3' : 'w-0'
            )}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPlaying(!playing)}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95',
              'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30'
            )}
          >
            {playing ? (
              <div className="flex gap-1">
                <div className="w-1 h-5 bg-white rounded" />
                <div className="w-1 h-5 bg-white rounded" />
              </div>
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
          <div className="text-sm text-gray-400">
            {playing ? '0:47 / 2:30' : '0:00 / 2:30'}
          </div>
        </div>
      </div>

      {/* Câu hỏi */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-3">❓ Câu hỏi</h4>
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="space-y-2">
              <p className="text-sm font-semibold text-white">
                {qi + 1}. {q.q}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() =>
                      setSelectedAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                    data-selected={selectedAnswers[qi] === oi}
                    className={cn(
                      'answer-choice text-left p-3 rounded-xl border text-sm font-medium transition-all',
                      selectedAnswers[qi] === oi
                        ? 'border-2 border-primary bg-accent text-accent-foreground'
                        : 'border-gray-700/40 bg-gray-800/40 text-gray-300 hover:border-gray-600'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Practice tab với 5 bài tập */
function PracticeTab({ isUnlocked }: { isUnlocked: boolean }) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!isUnlocked) return <LockedTab />

  const handleSubmit = () => {
    if (Object.keys(answers).length === MOCK_EXERCISES.length) {
      setSubmitted(true)
    }
  }

  const correctCount = submitted
    ? MOCK_EXERCISES.filter((ex) => answers[ex.id] === ex.correct).length
    : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white">5 bài tập luyện tập</h3>
        {submitted && (
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
            <Star className="w-4 h-4" />
            {correctCount}/{MOCK_EXERCISES.length} đúng
          </div>
        )}
      </div>

      {MOCK_EXERCISES.map((ex, idx) => (
        <div
          key={ex.id}
          className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-white">
            <span className="text-gray-500 mr-2">{idx + 1}.</span>
            {ex.question}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ex.options.map((opt, oi) => {
              const isSelected = answers[ex.id] === oi
              const isCorrect = oi === ex.correct
              let optStyle = 'border-gray-700/40 bg-gray-800/40 text-gray-300'
              if (submitted) {
                if (isCorrect) optStyle = 'border-green-500 bg-green-500/20 text-green-300'
                else if (isSelected && !isCorrect)
                  optStyle = 'border-red-500 bg-red-500/20 text-red-300'
              } else if (isSelected) {
                optStyle = 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
              }

              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() =>
                    !submitted && setAnswers((prev) => ({ ...prev, [ex.id]: oi }))
                  }
                  data-selected={!submitted && isSelected}
                  className={cn(
                    'answer-choice text-left p-3 rounded-xl border text-sm font-medium transition-all',
                    optStyle
                  )}
                >
                  <span className="text-xs opacity-60 mr-1.5">
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
          {/* Giải thích sau khi submit */}
          {submitted && (
            <div
              className={cn(
                'text-xs p-3 rounded-lg flex gap-2',
                answers[ex.id] === ex.correct
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              )}
            >
              <span>{answers[ex.id] === ex.correct ? '✅' : '❌'}</span>
              <span>{ex.explanation}</span>
            </div>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < MOCK_EXERCISES.length}
          className={cn(
            'w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]',
            Object.keys(answers).length === MOCK_EXERCISES.length
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          )}
        >
          {Object.keys(answers).length < MOCK_EXERCISES.length
            ? `Trả lời ${MOCK_EXERCISES.length - Object.keys(answers).length} câu nữa`
            : 'Kiểm tra kết quả'}
        </button>
      )}
    </div>
  )
}

/** Locked tab placeholder */
function LockedTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
        <Lock className="w-7 h-7 text-gray-500" />
      </div>
      <div className="text-center">
        <p className="text-gray-400 font-semibold">Hoàn thành phần trước</p>
        <p className="text-gray-600 text-sm mt-1">để mở khóa phần này</p>
      </div>
    </div>
  )
}

// ========================
// TodayLesson page chính
// ========================
export default function TodayLesson() {
  const navigate = useNavigate()
  const { addXP } = useProgressStore()
  const { currentWeek } = useLessonStore()

  const [activeTab, setActiveTab] = useState<TabKey>('vocabulary')
  const [completedSections, setCompletedSections] = useState<Set<TabKey>>(new Set())
  const [lessonDone, setLessonDone] = useState(false)

  // Tab được mở khóa theo thứ tự
  const getTabUnlocked = (tabKey: TabKey): boolean => {
    const order: TabKey[] = ['vocabulary', 'grammar', 'listening', 'practice']
    const tabIdx = order.indexOf(tabKey)
    if (tabIdx === 0) return true
    return completedSections.has(order[tabIdx - 1])
  }

  const handleCompleteSection = (section: TabKey) => {
    setCompletedSections((prev) => {
      const next = new Set(prev)
      next.add(section)
      return next
    })
    // Tự động sang tab tiếp theo
    const order: TabKey[] = ['vocabulary', 'grammar', 'listening', 'practice']
    const nextIdx = order.indexOf(section) + 1
    if (nextIdx < order.length) {
      setActiveTab(order[nextIdx])
    }
  }

  const allDone = completedSections.size === 4

  const handleCompleteLesson = () => {
    addXP(100)
    setLessonDone(true)
  }

  // Màn hình hoàn thành
  if (lessonDone) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-5 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/30">
          <Award className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Tuyệt vời! 🎉</h1>
        <p className="text-gray-400 text-base mb-8">
          Bạn đã hoàn thành bài học hôm nay
        </p>
        <div className="flex items-center gap-2 text-2xl font-black text-amber-400 mb-8">
          <Zap className="w-7 h-7" />
          +100 XP
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-base active:scale-[0.98] transition-transform"
        >
          Về trang chính
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      {/* ── Header ── */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div>
            <p className="text-xs text-gray-400 font-semibold">TUẦN {currentWeek}</p>
            <h1 className="text-lg font-black text-white leading-tight">Bài học hôm nay</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 text-amber-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">+100 XP</span>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const done = completedSections.has(tab.key)
            const unlocked = getTabUnlocked(tab.key)
            return (
              <div key={tab.key} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full h-1.5 rounded-full transition-all',
                    done
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : tab.key === activeTab
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      : 'bg-gray-700/60'
                  )}
                />
                <div className="flex items-center gap-1">
                  {done ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : unlocked ? (
                    <Circle className="w-3 h-3 text-gray-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-gray-600" />
                  )}
                  <span className={cn(
                    'text-[9px] font-bold',
                    done ? 'text-green-400' : tab.key === activeTab ? 'text-indigo-400' : 'text-gray-600'
                  )}>
                    {completedSections.size}/{TABS.length}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        {TABS.map((tab) => {
          const done = completedSections.has(tab.key)
          const unlocked = getTabUnlocked(tab.key)
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => unlocked && setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 relative transition-all',
                !unlocked && 'opacity-40 cursor-not-allowed'
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn(
                    'w-4.5 h-4.5',
                    isActive ? 'text-indigo-400' : 'text-gray-500'
                  )}
                  size={18}
                />
                {done && (
                  <CheckCircle2 className="absolute -top-1 -right-1 w-3 h-3 text-green-400 fill-green-400" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold',
                  isActive ? 'text-indigo-400' : 'text-gray-500'
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="px-5 pt-5">
        {activeTab === 'vocabulary' && (
          <VocabTab isUnlocked={getTabUnlocked('vocabulary')} />
        )}
        {activeTab === 'grammar' && (
          <GrammarTab isUnlocked={getTabUnlocked('grammar')} />
        )}
        {activeTab === 'listening' && (
          <ListeningTab isUnlocked={getTabUnlocked('listening')} />
        )}
        {activeTab === 'practice' && (
          <PracticeTab isUnlocked={getTabUnlocked('practice')} />
        )}

        {/* Nút hoàn thành section */}
        {!completedSections.has(activeTab) && getTabUnlocked(activeTab) && (
          <button
            onClick={() => handleCompleteSection(activeTab)}
            className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Hoàn thành phần này
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Complete lesson button khi xong tất cả */}
        {allDone && (
          <button
            onClick={handleCompleteLesson}
            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl shadow-amber-500/30"
          >
            <Award className="w-5 h-5" />
            Hoàn thành bài học · +100 XP
          </button>
        )}
      </div>
    </div>
  )
}
