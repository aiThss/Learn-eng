/**
 * Trang Ngữ Pháp - Grammar Lessons
 * Hiển thị bài học, giải thích, ví dụ, bài tập và AI explain
 */
import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { explainGrammar } from '@/services/ai/gemini'
import type { GrammarLesson, Exercise } from '@/types'
import { useProgressStore } from '@/store'
import { cn } from '@/lib/utils'

// ========================
// DỮ LIỆU BÀI HỌC NGỮ PHÁP PHASE 0
// ========================
const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'g001',
    title: 'To be (am/is/are)',
    titleVi: "Động từ 'To Be'",
    explanation: 'The verb "to be" is the most important verb in English.',
    explanationVi: `Động từ "to be" là động từ quan trọng nhất trong tiếng Anh. Nó dùng để:
• Nói về bản thân (I am a student)
• Mô tả người/vật (She is tall)
• Nói về địa điểm (They are at home)

**Ba dạng hiện tại:**
- I → am
- He / She / It → is
- You / We / They → are`,
    structure: 'Subject + am/is/are + [noun/adjective/location]',
    examples: [
      { sentence: 'I am a student.', translation: 'Tôi là học sinh.', note: 'I + am' },
      { sentence: 'She is beautiful.', translation: 'Cô ấy xinh đẹp.', note: 'She + is + tính từ' },
      { sentence: 'They are friends.', translation: 'Họ là bạn bè.', note: 'They + are + danh từ' },
      { sentence: 'We are at home.', translation: 'Chúng tôi ở nhà.', note: 'We + are + địa điểm' },
    ],
    exercises: [
      { id: 'e001', type: 'fill_blank', question: 'I ___ a teacher.', correctAnswer: 'am', explanation: 'I dùng với am', explanationVi: 'Với chủ ngữ I, ta dùng "am"', points: 10 },
      { id: 'e002', type: 'fill_blank', question: 'She ___ very happy today.', correctAnswer: 'is', explanation: 'She dùng với is', explanationVi: 'Với chủ ngữ She/He/It, ta dùng "is"', points: 10 },
      { id: 'e003', type: 'fill_blank', question: 'They ___ my best friends.', correctAnswer: 'are', explanation: 'They dùng với are', explanationVi: 'Với chủ ngữ You/We/They, ta dùng "are"', points: 10 },
    ],
    phase: 'PHASE_0',
    week: 1,
    tags: ['to-be', 'basic', 'verb'],
  },
  {
    id: 'g002',
    title: 'Simple Present Tense',
    titleVi: 'Thì Hiện Tại Đơn',
    explanation: 'Simple Present is used for habits, facts, and routines.',
    explanationVi: `Thì hiện tại đơn dùng để diễn đạt:
• **Thói quen / Hành động lặp lại**: I eat breakfast every day.
• **Sự thật hiển nhiên**: The sun rises in the east.
• **Thời gian biểu**: The train leaves at 8am.

**Công thức:**
- Câu khẳng định: S + V(s/es) + O
- Câu phủ định: S + do/does + not + V + O
- Câu hỏi: Do/Does + S + V + O?

**Lưu ý:** Chủ ngữ He/She/It → thêm **s** hoặc **es** vào động từ`,
    structure: 'S + V / V(s/es) + O',
    examples: [
      { sentence: 'I study English every day.', translation: 'Tôi học tiếng Anh mỗi ngày.', note: 'Thói quen hàng ngày' },
      { sentence: 'She works in a hospital.', translation: 'Cô ấy làm việc ở bệnh viện.', note: 'She → works (+s)' },
      { sentence: 'He does not like coffee.', translation: 'Anh ấy không thích cà phê.', note: 'Phủ định với does not' },
      { sentence: 'Do you speak English?', translation: 'Bạn có nói tiếng Anh không?', note: 'Câu hỏi với Do' },
    ],
    exercises: [
      { id: 'e004', type: 'fill_blank', question: 'She ___ (go) to school every morning.', correctAnswer: 'goes', explanation: 'She + go → goes', explanationVi: 'Chủ ngữ She nên động từ "go" phải thêm "es" → goes', points: 10 },
      { id: 'e005', type: 'fill_blank', question: '___ you like pizza? (Do/Does)', correctAnswer: 'Do', explanation: 'You dùng Do', explanationVi: 'Với chủ ngữ You/I/We/They, dùng "Do" để đặt câu hỏi', points: 10 },
      { id: 'e006', type: 'fill_blank', question: 'He ___ not play football.', correctAnswer: 'does', explanation: 'He + does not', explanationVi: 'Với chủ ngữ He/She/It, dùng "does not" để phủ định', points: 10 },
    ],
    phase: 'PHASE_0',
    week: 1,
    tags: ['present-simple', 'tense', 'basic'],
  },
  {
    id: 'g003',
    title: 'Articles (a / an / the)',
    titleVi: 'Mạo Từ a / an / the',
    explanation: 'Articles are used before nouns to specify them.',
    explanationVi: `Mạo từ dùng trước danh từ để chỉ định:

**A / AN (Mạo từ không xác định):**
- Dùng khi nhắc đến danh từ lần đầu
- **A** + phụ âm: a book, a car, a university
- **AN** + nguyên âm (a,e,i,o,u): an apple, an egg, an hour

**THE (Mạo từ xác định):**
- Dùng khi người nghe đã biết đối tượng đó
- Dùng khi chỉ có một thứ duy nhất: the sun, the moon
- Dùng lần thứ hai trở đi: I have a cat. The cat is white.`,
    structure: 'a + [consonant sound] | an + [vowel sound] | the + [specific noun]',
    examples: [
      { sentence: 'I have a dog.', translation: 'Tôi có một con chó.', note: 'a + phụ âm (d-)' },
      { sentence: 'She is eating an apple.', translation: 'Cô ấy đang ăn một quả táo.', note: 'an + nguyên âm (a-)' },
      { sentence: 'The dog is very cute.', translation: 'Con chó đó rất dễ thương.', note: 'the = con chó đã biết' },
      { sentence: 'The sun rises in the east.', translation: 'Mặt trời mọc ở phía đông.', note: 'the = duy nhất' },
    ],
    exercises: [
      { id: 'e007', type: 'fill_blank', question: 'I saw ___ elephant at the zoo. (a/an)', correctAnswer: 'an', explanation: 'elephant bắt đầu bằng nguyên âm e', explanationVi: '"elephant" bắt đầu bằng nguyên âm "e" nên dùng "an"', points: 10 },
      { id: 'e008', type: 'fill_blank', question: '___ moon is beautiful tonight. (A/The)', correctAnswer: 'The', explanation: 'moon là duy nhất', explanationVi: '"moon" chỉ có một nên dùng "The"', points: 10 },
      { id: 'e009', type: 'fill_blank', question: 'She is ___ doctor. (a/an)', correctAnswer: 'a', explanation: 'doctor bắt đầu bằng phụ âm d', explanationVi: '"doctor" bắt đầu bằng phụ âm "d" nên dùng "a"', points: 10 },
    ],
    phase: 'PHASE_0',
    week: 1,
    tags: ['articles', 'a-an-the', 'determiners'],
  },
]

// ========================
// TYPES
// ========================
interface ExerciseState {
  answers: Record<string, string>
  submitted: boolean
  score: number
}

// ========================
// EXERCISE COMPONENT - Bài tập điền từ
// ========================
interface FillBlankExerciseProps {
  exercise: Exercise
  answer: string
  submitted: boolean
  onChange: (value: string) => void
}

function FillBlankExercise({ exercise, answer, submitted, onChange }: FillBlankExerciseProps) {
  const isCorrect = answer.trim().toLowerCase() === String(exercise.correctAnswer).toLowerCase()

  // Chia câu hỏi thành phần trước và sau blank
  const parts = exercise.question.split('___')

  return (
    <div className={cn(
      'rounded-xl p-4 ring-1 transition-all',
      submitted
        ? isCorrect
          ? 'bg-emerald-900/20 ring-emerald-700/50'
          : 'bg-red-900/20 ring-red-700/50'
        : 'bg-gray-800 ring-gray-700/50'
    )}>
      {/* Câu hỏi với input inline */}
      <div className="flex flex-wrap items-center gap-1 text-white">
        <span>{parts[0]}</span>
        <input
          type="text"
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          disabled={submitted}
          className={cn(
            'inline-block w-24 rounded-lg border px-2 py-0.5 text-center text-sm font-semibold outline-none transition-colors',
            submitted
              ? isCorrect
                ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300'
                : 'border-red-500 bg-red-900/40 text-red-300'
              : 'border-indigo-500 bg-gray-700 text-white focus:border-indigo-400'
          )}
          placeholder="..."
        />
        {parts[1] && <span>{parts[1]}</span>}
      </div>

      {/* Kết quả sau khi nộp */}
      {submitted && (
        <div className={cn('mt-2 flex items-start gap-2 text-sm', isCorrect ? 'text-emerald-400' : 'text-red-400')}>
          {isCorrect
            ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          }
          <div>
            {!isCorrect && <p>Đáp án đúng: <strong>{String(exercise.correctAnswer)}</strong></p>}
            <p className="text-gray-400">{exercise.explanationVi}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ========================
// LESSON CARD COMPONENT
// ========================
interface LessonCardProps {
  lesson: GrammarLesson
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}

function LessonCard({ lesson, isActive, isCompleted, onClick }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl p-4 text-left transition-all ring-1',
        isActive
          ? 'bg-indigo-600/20 ring-indigo-500/60 shadow-lg shadow-indigo-900/20'
          : isCompleted
          ? 'bg-emerald-900/20 ring-emerald-700/40'
          : 'bg-gray-800 ring-gray-700/50 hover:bg-gray-700'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{lesson.titleVi}</p>
          <p className="text-xs text-gray-400">{lesson.title}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {lesson.tags.map(t => (
              <span key={t} className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                {t}
              </span>
            ))}
          </div>
        </div>
        {isCompleted && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
      </div>
    </button>
  )
}

// ========================
// TRANG CHÍNH
// ========================
export default function GrammarPage() {
  const { updateTodayActivity } = useProgressStore()

  const [selectedLessonId, setSelectedLessonId] = useState<string>(GRAMMAR_LESSONS[0].id)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [showExplanation, setShowExplanation] = useState(false)

  // Trạng thái AI Explain
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAiCard, setShowAiCard] = useState(false)

  // Trạng thái bài tập
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    answers: {},
    submitted: false,
    score: 0,
  })

  const lesson = GRAMMAR_LESSONS.find(l => l.id === selectedLessonId)!

  // Gọi AI giải thích ngữ pháp
  const handleAiExplain = async () => {
    setAiLoading(true)
    setAiError(null)
    setShowAiCard(true)

    try {
      const result = await explainGrammar(lesson.title, 'A1')
      if (result.data) {
        setAiResponse(result.data)
      } else {
        setAiError(result.errorMessage ?? 'Không thể kết nối AI')
      }
    } catch {
      setAiError('Lỗi không xác định')
    } finally {
      setAiLoading(false)
    }
  }

  // Nộp bài tập
  const handleSubmitExercises = () => {
    let correct = 0
    lesson.exercises.forEach(ex => {
      const ans = exerciseState.answers[ex.id] ?? ''
      if (ans.trim().toLowerCase() === String(ex.correctAnswer).toLowerCase()) {
        correct++
      }
    })
    const score = Math.round((correct / lesson.exercises.length) * 100)
    setExerciseState(prev => ({ ...prev, submitted: true, score }))
  }

  // Đánh dấu hoàn thành bài học
  const handleMarkDone = () => {
    setCompletedLessons(prev => new Set([...prev, lesson.id]))
    updateTodayActivity({ grammarLessons: 1 })

    // Chuyển sang bài tiếp theo
    const currentIdx = GRAMMAR_LESSONS.findIndex(l => l.id === lesson.id)
    if (currentIdx < GRAMMAR_LESSONS.length - 1) {
      setSelectedLessonId(GRAMMAR_LESSONS[currentIdx + 1].id)
      setExerciseState({ answers: {}, submitted: false, score: 0 })
      setAiResponse(null)
      setShowAiCard(false)
    }
  }

  // Đổi bài học → reset state
  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id)
    setExerciseState({ answers: {}, submitted: false, score: 0 })
    setAiResponse(null)
    setShowAiCard(false)
    setShowExplanation(false)
  }

  const isCompleted = completedLessons.has(lesson.id)

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="mx-auto max-w-2xl px-4 pt-4">

        {/* ===== TIÊU ĐỀ TRANG ===== */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600/20 p-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Ngữ Pháp</h1>
            <p className="text-sm text-gray-400">{completedLessons.size}/{GRAMMAR_LESSONS.length} bài hoàn thành</p>
          </div>
        </div>

        {/* ===== DANH SÁCH BÀI HỌC ===== */}
        <div className="mb-6 space-y-2">
          {GRAMMAR_LESSONS.map(l => (
            <LessonCard
              key={l.id}
              lesson={l}
              isActive={l.id === selectedLessonId}
              isCompleted={completedLessons.has(l.id)}
              onClick={() => handleSelectLesson(l.id)}
            />
          ))}
        </div>

        {/* ===== NỘI DUNG BÀI HỌC ===== */}
        <div className="rounded-2xl bg-gray-900 p-5 ring-1 ring-gray-700/50">

          {/* Tiêu đề bài */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{lesson.titleVi}</h2>
              <p className="text-sm text-gray-400">{lesson.title}</p>
            </div>
            {isCompleted && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-700/50">
                <CheckCircle2 className="h-3 w-3" />
                Hoàn thành
              </span>
            )}
          </div>

          {/* ===== GIẢI THÍCH NGỮ PHÁP ===== */}
          <div className="mb-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex w-full items-center justify-between rounded-xl bg-gray-800 px-4 py-3 text-left transition-colors hover:bg-gray-700"
            >
              <span className="font-semibold text-white">📖 Giải thích</span>
              {showExplanation ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {showExplanation && (
              <div className="mt-2 rounded-xl bg-gray-800/50 p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{lesson.explanationVi}</p>
              </div>
            )}
          </div>

          {/* ===== CÔNG THỨC NGỮ PHÁP ===== */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Cấu trúc</p>
            <div className="rounded-xl bg-gray-950 px-4 py-3 font-mono ring-1 ring-indigo-700/30">
              <span className="text-indigo-300">{lesson.structure}</span>
            </div>
          </div>

          {/* ===== VÍ DỤ ===== */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Ví dụ</p>
            <div className="space-y-2">
              {lesson.examples.map((ex, i) => (
                <div key={i} className="rounded-xl bg-gray-800 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-white">{ex.sentence}</p>
                    {ex.note && (
                      <span className="shrink-0 rounded-full bg-indigo-900/50 px-2 py-0.5 text-xs text-indigo-300">
                        {ex.note}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{ex.translation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ===== NÚT AI EXPLAIN ===== */}
          <button
            onClick={handleAiExplain}
            disabled={aiLoading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white transition-all hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70"
          >
            {aiLoading
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <Sparkles className="h-5 w-5" />
            }
            {aiLoading ? 'AI đang phân tích...' : 'AI Giải thích thêm'}
          </button>

          {/* AI Response Card - có thể thu gọn */}
          {showAiCard && (
            <div className="mb-4 rounded-xl bg-violet-900/20 p-4 ring-1 ring-violet-700/50">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">Giải thích từ AI</span>
              </div>
              {aiLoading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Đang tạo giải thích...</span>
                </div>
              ) : aiError ? (
                <div className="flex items-start gap-2 text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-sm">{aiError}</p>
                </div>
              ) : (
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{aiResponse}</p>
              )}
            </div>
          )}

          {/* ===== BÀI TẬP ĐIỀN TỪ ===== */}
          <div className="mb-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Bài tập điền vào chỗ trống</p>
            <div className="space-y-3">
              {lesson.exercises.map(ex => (
                <FillBlankExercise
                  key={ex.id}
                  exercise={ex}
                  answer={exerciseState.answers[ex.id] ?? ''}
                  submitted={exerciseState.submitted}
                  onChange={(val) => setExerciseState(prev => ({
                    ...prev,
                    answers: { ...prev.answers, [ex.id]: val }
                  }))}
                />
              ))}
            </div>

            {/* Nút nộp bài / điểm số */}
            {!exerciseState.submitted ? (
              <button
                onClick={handleSubmitExercises}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Kiểm tra đáp án
              </button>
            ) : (
              <div className="mt-4 rounded-xl bg-gray-800 p-4 text-center">
                <p className="text-2xl font-bold text-white">{exerciseState.score}%</p>
                <p className="text-sm text-gray-400">
                  {exerciseState.score === 100 ? '🎉 Xuất sắc! Bạn trả lời đúng tất cả!' :
                   exerciseState.score >= 66 ? '👍 Tốt! Hãy xem lại các câu sai.' :
                   '📚 Hãy đọc lại bài học và thử lại.'}
                </p>
                <button
                  onClick={() => setExerciseState({ answers: {}, submitted: false, score: 0 })}
                  className="mt-3 rounded-xl bg-gray-700 px-6 py-2 text-sm text-white hover:bg-gray-600"
                >
                  Làm lại
                </button>
              </div>
            )}
          </div>

          {/* ===== NÚT ĐÁNH DẤU HOÀN THÀNH ===== */}
          {!isCompleted && (
            <button
              onClick={handleMarkDone}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-5 w-5" />
              Đánh dấu hoàn thành
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
