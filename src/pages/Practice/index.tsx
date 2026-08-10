/**
 * Practice - Trang Luyện tập / Kiểm tra / Mock IELTS
 * Hỗ trợ 3 mode, nhiều dạng bài, timer, điều hướng câu hỏi, màn kết quả
 */
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
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

const MODE_CONFIG: Record<Mode, { label: string; time: number | null; description: string }> = {
  practice: { label: 'Luyện tập', time: null, description: 'Không giới hạn thời gian' },
  test: { label: 'Kiểm tra', time: 15 * 60, description: '15 phút' },
  mock_ielts: { label: 'Mock IELTS', time: 20 * 60, description: '20 phút' },
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
    <div className="min-h-full bg-background px-4 py-6 sm:py-8">
      {/* Score circle lớn, có animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#dbeafe"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#2563eb"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-foreground">{percent}%</span>
            <span className="text-xs text-muted-foreground">điểm</span>
          </div>
        </div>

        <h2 className="mb-1 text-2xl font-black text-foreground">
          {percent >= 80 ? '🎉 Xuất sắc!' : percent >= 60 ? '👏 Tốt lắm!' : '💪 Cố lên!'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Đúng {correct}/{total} câu
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-[1.25rem] border border-[#a7f3d0] bg-[#ecfdf5] p-3 text-center">
          <CheckCircle className="mx-auto mb-1 h-6 w-6 text-success" />
          <div className="text-2xl font-black text-success">{correct}</div>
          <div className="text-[11px] text-muted-foreground">Đúng</div>
        </div>
        <div className="rounded-[1.25rem] border border-[#fecaca] bg-[#fef2f2] p-3 text-center">
          <XCircle className="mx-auto mb-1 h-6 w-6 text-destructive" />
          <div className="text-2xl font-black text-destructive">{total - correct}</div>
          <div className="text-[11px] text-muted-foreground">Sai</div>
        </div>
        <div className="rounded-[1.25rem] border border-[#bfdbfe] bg-[#eaf2ff] p-3 text-center">
          <Trophy className="mx-auto mb-1 h-6 w-6 text-primary" />
          <div className="text-2xl font-black text-primary">{ieltsEst}</div>
          <div className="text-[11px] text-muted-foreground">IELTS dự đoán</div>
        </div>
      </div>

      {/* Review câu sai */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
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
                className="rounded-[1.25rem] border border-[#fecaca] bg-[#fef2f2] p-4"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                </div>
                <div className="space-y-1 ml-7">
                  <p className="text-xs text-destructive">
                    ❌ Bạn trả lời:{' '}
                    <span className="font-semibold">
                      {answers[q.id] || '(không trả lời)'}
                    </span>
                  </p>
                  <p className="text-xs text-success">
                    ✅ Đáp án đúng:{' '}
                    <span className="font-semibold">{q.correctAnswer}</span>
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    💡 {q.explanationVi}
                  </p>
                </div>
              </div>
            ))}

          {total - correct === 0 && (
            <div className="py-6 text-center text-success">
              <CheckCircle className="mx-auto mb-2 h-10 w-10" />
              <p className="font-semibold">Hoàn hảo! Không có câu sai!</p>
            </div>
          )}
        </div>
      </div>

      {/* Nút làm lại */}
      <button
        onClick={onRetry}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.25rem] bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedMode = searchParams.get('mode')
  const mode: Mode = requestedMode === 'test' || requestedMode === 'mock_ielts' ? requestedMode : 'practice'
  const stage = searchParams.get('stage')
  const started = stage === 'doing' || stage === 'result'
  const submitted = stage === 'result'
  const requestedQuestion = Number(searchParams.get('question'))
  const currentIdx = Math.min(
    PRACTICE_QUESTIONS.length - 1,
    Math.max(0, Number.isInteger(requestedQuestion) && requestedQuestion > 0 ? requestedQuestion - 1 : 0),
  )
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [fillInput, setFillInput] = useState('')

  const currentQ = PRACTICE_QUESTIONS[currentIdx]

  const setPracticeRoute = useCallback((nextMode: Mode, nextStage: 'select' | 'doing' | 'result', question = 0) => {
    const next = new URLSearchParams()
    if (nextMode !== 'practice') next.set('mode', nextMode)
    if (nextStage !== 'select') next.set('stage', nextStage)
    if (nextStage === 'doing') next.set('question', String(question + 1))
    setSearchParams(next)
  }, [setSearchParams])

  const chooseMode = (nextMode: Mode) => setPracticeRoute(nextMode, 'select')
  const beginPractice = () => setPracticeRoute(mode, 'doing')
  const selectQuestion = (question: number) => setPracticeRoute(mode, 'doing', question)
  const finishPractice = useCallback(() => setPracticeRoute(mode, 'result'), [mode, setPracticeRoute])

  // Khởi động timer khi bắt đầu
  useEffect(() => {
    if (!started || submitted) return
    const timeLimit = MODE_CONFIG[mode].time
    if (!timeLimit) return

    setTimeLeft(timeLimit)
  }, [started, mode, submitted])

  // Đếm ngược timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          finishPractice() // Auto submit khi hết giờ
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [finishPractice, submitted, timeLeft])

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
    correct: 'bg-success text-white',
    wrong: 'bg-destructive text-white',
    answered: 'bg-primary text-white',
    current: 'bg-card text-foreground ring-2 ring-primary',
    unanswered: 'bg-muted text-muted-foreground',
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
      selectQuestion(currentIdx + 1)
    }
  }

  const goPrev = () => {
    if (currentIdx > 0) {
      selectQuestion(currentIdx - 1)
    }
  }

  // Submit
  const handleSubmit = () => {
    if (currentQ.type === 'fill_blank' && fillInput.trim()) {
      setAnswer(fillInput)
    }
    finishPractice()
  }

  // Reset
  const handleReset = () => {
    setPracticeRoute(mode, 'select')
    setAnswers({})
    setFillInput('')
    setTimeLeft(null)
  }

  // ── Màn chọn mode ──
  if (!started) {
    return (
      <div className="min-h-full bg-background px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary text-white shadow-card">
            <Target className="h-7 w-7" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Chọn chế độ học</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tùy theo mục tiêu và quỹ thời gian của bạn</p>
        </div>

        {/* Mode selector */}
        <div className="mb-6 space-y-2.5" role="radiogroup" aria-label="Chọn chế độ luyện tập">
          {(Object.entries(MODE_CONFIG) as [Mode, (typeof MODE_CONFIG)[Mode]][]).map(
            ([id, cfg]) => {
              const Icon = id === 'practice' ? BookOpen : id === 'test' ? Timer : Trophy
              const isSelected = mode === id

              return (
              <button
                key={id}
                onClick={() => chooseMode(id)}
                className={cn(
                  'min-h-[88px] w-full rounded-[1.25rem] border bg-card p-4 text-left shadow-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isSelected
                    ? 'border-2 border-primary bg-[#eaf2ff]'
                    : 'border-border hover:border-border-strong hover:bg-muted'
                )}
                role="radio"
                aria-checked={isSelected}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        isSelected ? 'bg-primary text-white' : 'bg-muted text-primary'
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className={cn('font-bold', isSelected ? 'text-[#102a4c]' : 'text-foreground')}>
                        {cfg.label}
                      </p>
                      <p className={cn('mt-0.5 text-sm', isSelected ? 'text-[#365f92]' : 'text-muted-foreground')}>
                        {cfg.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                      isSelected ? 'border-primary' : 'border-border-strong'
                    )}
                  >
                    {isSelected && (
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </button>
              )
            }
          )}
        </div>

        {/* Thông tin bài */}
        <div className="mb-6 rounded-[1.25rem] border border-border bg-card p-4 shadow-card">
          <h3 className="mb-4 text-base font-bold text-foreground">Nội dung bài luyện</h3>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
              <span>10 câu hỏi</span>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
              <span>Ngữ pháp + Từ vựng</span>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-success" strokeWidth={2} />
              <span>Trắc nghiệm A/B/C/D</span>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
              <span>Điền vào chỗ trống</span>
            </div>
          </div>
        </div>

        <button
          onClick={beginPractice}
          className="min-h-14 w-full rounded-[1.25rem] bg-primary px-6 py-4 text-base font-bold text-white shadow-card transition-colors hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Bắt đầu luyện tập
        </button>
        </div>
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
    <div className="flex min-h-full flex-col bg-background text-foreground">
      {/* Header: mode + timer */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">
            {MODE_CONFIG[mode].label}
          </div>

          {/* Timer */}
          {timeLeft !== null && (
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                timeLeft < 60
                  ? 'border-[#fecaca] bg-[#fef2f2] text-destructive'
                  : 'border-border bg-muted text-foreground'
              )}
            >
              <Timer className="w-3.5 h-3.5" />
              <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Navigation dots */}
        <div className="flex flex-wrap gap-1.5" aria-label="Điều hướng câu hỏi">
          {PRACTICE_QUESTIONS.map((_, idx) => {
            const status = getQuestionStatus(idx)
            return (
              <button
                key={idx}
                onClick={() => selectQuestion(idx)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  dotColor[status]
                )}
                aria-label={`Câu ${idx + 1}`}
                aria-current={status === 'current' ? 'step' : undefined}
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
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Câu {currentIdx + 1}/{PRACTICE_QUESTIONS.length}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold',
              currentQ.category === 'grammar'
                ? 'bg-[#eaf2ff] text-primary'
                : 'bg-[#fffbeb] text-warning'
            )}
          >
            {currentQ.category === 'grammar' ? 'Ngữ pháp' : 'Từ vựng'}
          </span>
        </div>

        {/* Câu hỏi card */}
        <div className="mb-5 rounded-[1.25rem] border border-border bg-card p-4 shadow-card">
          <p className="text-base font-semibold leading-relaxed text-foreground">
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
                  data-selected={isSelected}
                  className={cn(
                    'answer-choice flex min-h-14 w-full items-center gap-3 rounded-[1.25rem] border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isSelected
                      ? 'border-2 border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-card text-foreground hover:border-border-strong hover:bg-muted'
                  )}
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      'answer-choice-marker flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
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
                    'flex min-h-28 flex-col items-center justify-center rounded-[1.25rem] border py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isSelected
                      ? val === 'A'
                        ? 'border-2 border-success bg-[#ecfdf5] text-foreground'
                        : 'border-2 border-destructive bg-[#fef2f2] text-foreground'
                      : 'border-border bg-card text-foreground hover:border-border-strong hover:bg-muted'
                  )}
                  aria-pressed={isSelected}
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
                'w-full rounded-[1.25rem] border border-border bg-card px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground',
                'outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
              )}
            />
            <p className="text-center text-xs text-muted-foreground">
              💡 Điền đầy đủ dạng động từ, không viết tắt
            </p>
          </div>
        )}
      </div>

      {/* Navigation + Submit */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-border bg-card text-muted-foreground shadow-card transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {currentIdx === PRACTICE_QUESTIONS.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[1rem] bg-primary px-4 py-3 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CheckCircle className="w-4 h-4" />
              Nộp bài
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[1rem] bg-primary px-4 py-3 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
