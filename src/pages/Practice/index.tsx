/**
 * Practice - Trang Luyện tập / Kiểm tra / Mock IELTS
 * Hỗ trợ 3 mode, nhiều dạng bài, timer, điều hướng câu hỏi, màn kết quả
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Timer,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  BookOpen,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ========================
// 10 câu hỏi luyện tập (grammar + vocabulary)
// ========================
interface PracticeQuestion {
  id: string
  type: 'multiple_choice' | 'fill_blank' | 'true_false'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  explanationVi: string
  category: 'grammar' | 'vocabulary'
}

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'p1',
    type: 'multiple_choice',
    question: 'She _____ to school every day.',
    options: ['go', 'goes', 'going', 'went'],
    correctAnswer: 'B',
    explanation: 'With third-person singular (she/he/it), we add -s/-es to the verb.',
    explanationVi: 'Với chủ ngữ ngôi 3 số ít (she/he/it), động từ thêm -s/-es.',
    category: 'grammar',
  },
  {
    id: 'p2',
    type: 'multiple_choice',
    question: 'What is the meaning of "generous"?',
    options: ['Greedy', 'Kind and giving', 'Angry', 'Shy'],
    correctAnswer: 'B',
    explanation: '"Generous" means willing to give more of something than is expected.',
    explanationVi: '"Generous" có nghĩa là hào phóng, sẵn lòng cho đi nhiều hơn.',
    category: 'vocabulary',
  },
  {
    id: 'p3',
    type: 'fill_blank',
    question: 'I _____ (be) a student. (Present Simple)',
    correctAnswer: 'am',
    explanation: 'With "I", we use "am" for the verb "to be".',
    explanationVi: 'Với chủ ngữ "I", động từ "to be" ở dạng "am".',
    category: 'grammar',
  },
  {
    id: 'p4',
    type: 'true_false',
    question: '"Enormous" means very large.',
    options: ['True', 'False'],
    correctAnswer: 'A',
    explanation: 'True. "Enormous" means extremely large in size or quantity.',
    explanationVi: 'Đúng. "Enormous" có nghĩa là rất lớn, to lớn về kích thước hoặc số lượng.',
    category: 'vocabulary',
  },
  {
    id: 'p5',
    type: 'multiple_choice',
    question: 'Which sentence is correct?',
    options: [
      'He don\'t like coffee.',
      'He doesn\'t likes coffee.',
      'He doesn\'t like coffee.',
      'He not like coffee.',
    ],
    correctAnswer: 'C',
    explanation:
      'With he/she/it, use "doesn\'t" + base verb (no -s). "Doesn\'t like" is correct.',
    explanationVi:
      'Với he/she/it, dùng "doesn\'t" + động từ nguyên thể (không thêm -s). "Doesn\'t like" là đúng.',
    category: 'grammar',
  },
  {
    id: 'p6',
    type: 'multiple_choice',
    question: 'Choose the correct word: The movie was _____ (very interesting).',
    options: ['fascinated', 'fascinating', 'fascinatingly', 'fascinate'],
    correctAnswer: 'B',
    explanation:
      '"Fascinating" (adj) describes something that causes interest. "Fascinated" describes how a person feels.',
    explanationVi:
      '"Fascinating" (tính từ) mô tả thứ gì đó thú vị. "Fascinated" mô tả cảm giác của người.',
    category: 'vocabulary',
  },
  {
    id: 'p7',
    type: 'fill_blank',
    question: 'They _____ (not/watch) TV right now. (Present Continuous)',
    correctAnswer: "aren't watching",
    explanation: 'Present Continuous negative: Subject + am/is/are + not + verb-ing.',
    explanationVi: 'Phủ định Present Continuous: Chủ ngữ + am/is/are + not + V-ing.',
    category: 'grammar',
  },
  {
    id: 'p8',
    type: 'true_false',
    question: 'The opposite of "ancient" is "modern".',
    options: ['True', 'False'],
    correctAnswer: 'A',
    explanation: 'True. "Ancient" means very old; its opposite is "modern" (new/current).',
    explanationVi: 'Đúng. "Ancient" là cổ xưa; từ trái nghĩa là "modern" (hiện đại).',
    category: 'vocabulary',
  },
  {
    id: 'p9',
    type: 'multiple_choice',
    question: 'I _____ my homework yet. (Present Perfect)',
    options: ["haven't finished", "didn't finish", "not finish", "don't finish"],
    correctAnswer: 'A',
    explanation:
      'With "yet" in negative sentences, use Present Perfect: have/has + not + past participle.',
    explanationVi:
      'Với "yet" trong câu phủ định, dùng Present Perfect: have/has + not + quá khứ phân từ.',
    category: 'grammar',
  },
  {
    id: 'p10',
    type: 'multiple_choice',
    question: '"Persevere" means to _____ despite difficulties.',
    options: ['give up', 'continue trying', 'take a break', 'ask for help'],
    correctAnswer: 'B',
    explanation:
      '"Persevere" means to continue doing something despite difficulty or delay in achieving success.',
    explanationVi:
      '"Persevere" có nghĩa là kiên trì, tiếp tục cố gắng dù gặp khó khăn.',
    category: 'vocabulary',
  },
]

// ========================
// Mode và config
// ========================
type Mode = 'practice' | 'test' | 'mock_ielts'

const MODE_CONFIG: Record<Mode, { label: string; time: number | null; color: string }> = {
  practice: { label: 'Luyện tập', time: null, color: 'from-indigo-600 to-purple-600' },
  test: { label: 'Kiểm tra', time: 15 * 60, color: 'from-amber-500 to-orange-500' },
  mock_ielts: { label: 'Mock IELTS', time: 20 * 60, color: 'from-rose-600 to-pink-600' },
}

// ========================
// Màn kết quả
// ========================
function ResultScreen({
  questions,
  answers,
  onRetry,
}: {
  questions: PracticeQuestion[]
  answers: Record<string, string>
  onRetry: () => void
}) {
  const correct = questions.filter((q) => {
    const a = answers[q.id]?.trim().toLowerCase()
    const c = q.correctAnswer.trim().toLowerCase()
    return a === c
  }).length

  const total = questions.length
  const percent = Math.round((correct / total) * 100)

  // Ước tính IELTS từ điểm số
  const ieltsEst =
    percent >= 90
      ? '6.5'
      : percent >= 75
      ? '5.5'
      : percent >= 60
      ? '5.0'
      : percent >= 45
      ? '4.5'
      : '4.0'

  // Animation circle
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 pb-24">
      {/* Score circle lớn, có animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(99,102,241,0.15)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#resultGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
            <defs>
              <linearGradient id="resultGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{percent}%</span>
            <span className="text-xs text-gray-400">điểm</span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">
          {percent >= 80 ? '🎉 Xuất sắc!' : percent >= 60 ? '👏 Tốt lắm!' : '💪 Cố lên!'}
        </h2>
        <p className="text-gray-400 text-sm">
          Đúng {correct}/{total} câu
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-3 text-center">
          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-green-400">{correct}</div>
          <div className="text-[11px] text-gray-400">Đúng</div>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-3 text-center">
          <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-red-400">{total - correct}</div>
          <div className="text-[11px] text-gray-400">Sai</div>
        </div>
        <div className="bg-amber-900/30 border border-amber-500/30 rounded-2xl p-3 text-center">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-amber-400">{ieltsEst}</div>
          <div className="text-[11px] text-gray-400">IELTS est.</div>
        </div>
      </div>

      {/* Review câu sai */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Xem lại câu sai
        </h3>
        <div className="space-y-3">
          {questions
            .filter((q) => {
              const a = answers[q.id]?.trim().toLowerCase()
              const c = q.correctAnswer.trim().toLowerCase()
              return a !== c
            })
            .map((q, idx) => (
              <div
                key={q.id}
                className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/30 text-red-400 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-white font-medium">{q.question}</p>
                </div>
                <div className="space-y-1 ml-7">
                  <p className="text-xs text-red-400">
                    ❌ Bạn trả lời:{' '}
                    <span className="font-semibold">
                      {answers[q.id] || '(không trả lời)'}
                    </span>
                  </p>
                  <p className="text-xs text-green-400">
                    ✅ Đáp án đúng:{' '}
                    <span className="font-semibold">{q.correctAnswer}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    💡 {q.explanationVi}
                  </p>
                </div>
              </div>
            ))}

          {total - correct === 0 && (
            <div className="text-center py-6 text-green-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-2" />
              <p className="font-semibold">Hoàn hảo! Không có câu sai!</p>
            </div>
          )}
        </div>
      </div>

      {/* Nút làm lại */}
      <button
        onClick={onRetry}
        className={cn(
          'w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200',
          'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
          'hover:from-indigo-500 hover:to-purple-500',
          'flex items-center justify-center gap-2'
        )}
      >
        <RotateCcw className="w-4 h-4" />
        Làm lại
      </button>
    </div>
  )
}

// ========================
// Trang chính Practice
// ========================
export default function Practice() {
  const [mode, setMode] = useState<Mode>('practice')
  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [fillInput, setFillInput] = useState('')

  const currentQ = PRACTICE_QUESTIONS[currentIdx]

  // Khởi động timer khi bắt đầu
  useEffect(() => {
    if (!started) return
    const timeLimit = MODE_CONFIG[mode].time
    if (!timeLimit) return

    setTimeLeft(timeLimit)
  }, [started, mode])

  // Đếm ngược timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          setSubmitted(true) // Auto submit khi hết giờ
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // Format timer MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Trạng thái câu hỏi (cho navigation dots)
  const getQuestionStatus = useCallback(
    (idx: number): 'correct' | 'wrong' | 'answered' | 'current' | 'unanswered' => {
      const q = PRACTICE_QUESTIONS[idx]
      const a = answers[q.id]
      if (idx === currentIdx && !submitted) return 'current'
      if (!a) return 'unanswered'
      if (!submitted) return 'answered'
      const isCorrect = a.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      return isCorrect ? 'correct' : 'wrong'
    },
    [answers, currentIdx, submitted]
  )

  const dotColor: Record<string, string> = {
    correct: 'bg-green-500',
    wrong: 'bg-red-500',
    answered: 'bg-indigo-500',
    current: 'bg-white ring-2 ring-indigo-500',
    unanswered: 'bg-gray-600',
  }

  // Đặt đáp án cho câu hiện tại
  const setAnswer = (value: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }))
  }

  // Điều hướng
  const goNext = () => {
    if (currentQ.type === 'fill_blank') {
      setAnswer(fillInput)
      setFillInput('')
    }
    if (currentIdx < PRACTICE_QUESTIONS.length - 1) {
      setCurrentIdx((i) => i + 1)
    }
  }

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1)
    }
  }

  // Submit
  const handleSubmit = () => {
    if (currentQ.type === 'fill_blank' && fillInput.trim()) {
      setAnswer(fillInput)
    }
    setSubmitted(true)
  }

  // Reset
  const handleReset = () => {
    setStarted(false)
    setSubmitted(false)
    setAnswers({})
    setCurrentIdx(0)
    setFillInput('')
    setTimeLeft(null)
  }

  // ── Màn chọn mode ──
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-4 py-8 pb-24">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Luyện tập</h1>
          <p className="text-gray-400 text-sm">Chọn chế độ phù hợp với mục tiêu của bạn</p>
        </div>

        {/* Mode selector */}
        <div className="space-y-3 mb-8">
          {(Object.entries(MODE_CONFIG) as [Mode, (typeof MODE_CONFIG)[Mode]][]).map(
            ([id, cfg]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border transition-all duration-200',
                  mode === id
                    ? 'border-indigo-500 bg-indigo-900/30'
                    : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        `bg-gradient-to-br ${cfg.color}`
                      )}
                    >
                      {id === 'practice' ? (
                        <BookOpen className="w-5 h-5 text-white" />
                      ) : id === 'test' ? (
                        <Timer className="w-5 h-5 text-white" />
                      ) : (
                        <Trophy className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{cfg.label}</p>
                      <p className="text-xs text-gray-400">
                        {cfg.time ? `${cfg.time / 60} phút` : 'Không giới hạn thời gian'}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      mode === id ? 'border-indigo-500' : 'border-gray-600'
                    )}
                  >
                    {mode === id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                </div>
              </button>
            )
          )}
        </div>

        {/* Thông tin bài */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-300 mb-3">Nội dung bài luyện:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              10 câu hỏi
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Grammar + Vocabulary
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              Trắc nghiệm A/B/C/D
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Điền vào chỗ trống
            </div>
          </div>
        </div>

        <button
          onClick={() => setStarted(true)}
          className={cn(
            'w-full py-4 rounded-2xl font-black text-white text-base',
            `bg-gradient-to-r ${MODE_CONFIG[mode].color}`,
            'shadow-lg transition-all duration-200 active:scale-[0.98]'
          )}
        >
          Bắt đầu {MODE_CONFIG[mode].label}
        </button>
      </div>
    )
  }

  // ── Màn kết quả ──
  if (submitted) {
    return (
      <ResultScreen
        questions={PRACTICE_QUESTIONS}
        answers={answers}
        onRetry={handleReset}
      />
    )
  }

  // ── Màn làm bài ──
  const userAnswer = answers[currentQ.id] ?? ''

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header: mode + timer */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-gray-900/80 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              `bg-gradient-to-r ${MODE_CONFIG[mode].color}`,
              'text-white text-xs font-bold'
            )}
          >
            {MODE_CONFIG[mode].label}
          </div>

          {/* Timer */}
          {timeLeft !== null && (
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                timeLeft < 60
                  ? 'bg-red-900/40 border border-red-500/40 text-red-400'
                  : 'bg-gray-800/60 border border-gray-700/50 text-gray-300'
              )}
            >
              <Timer className="w-3.5 h-3.5" />
              <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Navigation dots */}
        <div className="flex gap-1.5 flex-wrap">
          {PRACTICE_QUESTIONS.map((_, idx) => {
            const status = getQuestionStatus(idx)
            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={cn(
                  'w-7 h-7 rounded-lg text-[10px] font-bold transition-all duration-150',
                  dotColor[status],
                  status === 'current' ? 'text-gray-900' : 'text-white'
                )}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Câu hỏi */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-400 font-medium">
            Câu {currentIdx + 1}/{PRACTICE_QUESTIONS.length}
          </span>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              currentQ.category === 'grammar'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'bg-amber-500/20 text-amber-400'
            )}
          >
            {currentQ.category === 'grammar' ? 'Ngữ pháp' : 'Từ vựng'}
          </span>
        </div>

        {/* Câu hỏi card */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 mb-5">
          <p className="text-white font-semibold text-base leading-relaxed">
            {currentQ.question}
          </p>
        </div>

        {/* Multiple choice */}
        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <div className="space-y-2.5">
            {currentQ.options.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i]
              const isSelected = userAnswer === letter
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(letter)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-150',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-900/30 text-white'
                      : 'border-gray-700/50 bg-gray-800/40 text-gray-300 hover:border-gray-600 hover:bg-gray-800/60'
                  )}
                >
                  <span
                    className={cn(
                      'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold',
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400'
                    )}
                  >
                    {letter}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* True/False */}
        {currentQ.type === 'true_false' && currentQ.options && (
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              const val = i === 0 ? 'A' : 'B'
              const isSelected = userAnswer === val
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(val)}
                  className={cn(
                    'flex flex-col items-center justify-center py-5 rounded-2xl border transition-all duration-150',
                    isSelected
                      ? val === 'A'
                        ? 'border-green-500 bg-green-900/30 text-green-400'
                        : 'border-red-500 bg-red-900/30 text-red-400'
                      : 'border-gray-700/50 bg-gray-800/40 text-gray-300 hover:border-gray-600'
                  )}
                >
                  <span className="text-2xl mb-1">{i === 0 ? '✅' : '❌'}</span>
                  <span className="text-sm font-bold">{opt}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Fill in the blank */}
        {currentQ.type === 'fill_blank' && (
          <div className="space-y-3">
            <input
              type="text"
              value={fillInput || userAnswer}
              onChange={(e) => {
                setFillInput(e.target.value)
              }}
              placeholder="Điền vào đây..."
              className={cn(
                'w-full bg-gray-800/60 border border-gray-700/50 rounded-2xl',
                'px-4 py-4 text-white placeholder-gray-500 text-sm',
                'outline-none focus:border-indigo-500/60 transition-colors'
              )}
            />
            <p className="text-xs text-gray-500 text-center">
              💡 Điền đầy đủ dạng động từ, không viết tắt
            </p>
          </div>
        )}
      </div>

      {/* Navigation + Submit */}
      <div className="flex-shrink-0 px-4 py-4 bg-gray-900/80 border-t border-gray-800/50">
        <div className="flex gap-3 items-center">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="w-11 h-11 rounded-2xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {currentIdx === PRACTICE_QUESTIONS.length - 1 ? (
            <button
              onClick={handleSubmit}
              className={cn(
                'flex-1 py-3 rounded-2xl font-bold text-white text-sm transition-all duration-200',
                `bg-gradient-to-r ${MODE_CONFIG[mode].color}`,
                'flex items-center justify-center gap-2'
              )}
            >
              <CheckCircle className="w-4 h-4" />
              Nộp bài
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex-1 py-3 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center gap-2 transition-all duration-200"
            >
              Câu tiếp theo
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
