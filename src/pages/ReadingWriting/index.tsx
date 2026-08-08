/**
 * ReadingWriting - Trang Đọc & Viết
 * 2 tabs: Đọc hiểu và Luyện viết với AI grading
 */
import { useState, useRef } from 'react'
import {
  BookOpen,
  PenLine,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { gradeWriting } from '@/services/ai/gemini'

// ========================
// Dữ liệu mẫu: Đoạn đọc hiểu
// ========================
const READING_PASSAGE = {
  title: 'A Day in Hanoi',
  content: `Hanoi is the capital city of Vietnam. Every morning, the streets come alive with the sounds of motorbikes and the smell of fresh bread from street vendors. Many people start their day with a bowl of pho, a traditional Vietnamese noodle soup.

The Old Quarter is the heart of Hanoi. It has narrow streets, each named after the goods once sold there, such as Hang Bac (Silver Street) and Hang Dao (Silk Street). Today, these streets are full of shops selling everything from souvenirs to clothing.

In the evening, families gather at Hoan Kiem Lake, a beautiful lake in the center of the city. Children play, elderly people do morning exercises, and couples walk hand in hand around the lake. The Huc Bridge, painted bright red, leads to a small island with a temple where people come to pray.

Life in Hanoi is busy but warm. Despite the rapid growth of the city, Vietnamese people still hold on to their traditions and family values.`,
  wordCount: 158,
  vocabulary: [
    { word: 'capital', meaning: 'thủ đô' },
    { word: 'vendor', meaning: 'người bán hàng rong' },
    { word: 'traditional', meaning: 'truyền thống' },
    { word: 'narrow', meaning: 'hẹp' },
    { word: 'souvenir', meaning: 'đồ lưu niệm' },
    { word: 'prayer', meaning: 'cầu nguyện' },
    { word: 'rapid', meaning: 'nhanh chóng' },
    { word: 'tradition', meaning: 'phong tục, truyền thống' },
  ],
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice' as const,
      question: 'What is Hanoi?',
      options: [
        'A small village in Vietnam',
        'The capital city of Vietnam',
        'A beach resort in Vietnam',
        'A mountain town in Vietnam',
      ],
      correctAnswer: '1',
      explanation: 'The passage states: "Hanoi is the capital city of Vietnam."',
    },
    {
      id: 'q2',
      type: 'multiple_choice' as const,
      question: 'What do many people eat for breakfast in Hanoi?',
      options: ['Fresh bread', 'Rice and vegetables', 'Pho (noodle soup)', 'Fried rice'],
      correctAnswer: '2',
      explanation:
        'The passage says: "Many people start their day with a bowl of pho, a traditional Vietnamese noodle soup."',
    },
    {
      id: 'q3',
      type: 'true_false' as const,
      question: 'The Old Quarter streets are named after goods that were once sold there.',
      options: ['True', 'False'],
      correctAnswer: '0',
      explanation:
        'True. The passage says each street was "named after the goods once sold there."',
    },
    {
      id: 'q4',
      type: 'multiple_choice' as const,
      question: 'What color is the Huc Bridge?',
      options: ['Blue', 'Gold', 'White', 'Bright red'],
      correctAnswer: '3',
      explanation: 'The passage describes: "The Huc Bridge, painted bright red..."',
    },
    {
      id: 'q5',
      type: 'true_false' as const,
      question: 'Vietnamese people have completely abandoned their traditions due to city growth.',
      options: ['True', 'False'],
      correctAnswer: '1',
      explanation:
        'False. The passage says: "Vietnamese people still hold on to their traditions and family values."',
    },
  ],
}

// ========================
// Dữ liệu mẫu: Writing prompt
// ========================
const WRITING_PROMPT = {
  title: 'Write about your daily routine',
  titleVi: 'Viết về thói quen hàng ngày của bạn',
  description:
    'Describe your typical day from morning to evening. Include activities, times, and how you feel about your routine.',
  descriptionVi:
    'Mô tả một ngày điển hình của bạn từ sáng đến tối. Bao gồm các hoạt động, thời gian và cảm nhận của bạn.',
  wordLimit: { min: 50, max: 80 },
  sampleAnswer:
    'Every day, I wake up at 6:30 AM and do some exercise. After breakfast, I go to school at 7:30 AM. Classes finish at 4:30 PM. In the evening, I study English for one hour and help my mother cook dinner. I usually go to bed at 10 PM. I enjoy my routine because it keeps me healthy and organized.',
}

// ========================
// Tab: Reading (Đọc hiểu)
// ========================
function ReadingTab() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [showVocab, setShowVocab] = useState(false)
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)

  const handleAnswer = (questionId: string, answerIndex: string) => {
    if (checked) return
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleCheck = () => setChecked(true)

  const handleReset = () => {
    setAnswers({})
    setChecked(false)
  }

  // Tính điểm
  const score = checked
    ? READING_PASSAGE.questions.filter(
        (q) => answers[q.id] === q.correctAnswer
      ).length
    : 0

  return (
    <div className="space-y-5">
      {/* Thẻ bài đọc */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
          <div>
            <h2 className="font-bold text-white text-base">{READING_PASSAGE.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{READING_PASSAGE.wordCount} từ</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
            <BookOpen className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">A1</span>
          </div>
        </div>

        {/* Nội dung bài đọc */}
        <div className="px-4 py-4">
          {READING_PASSAGE.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-gray-200 text-sm leading-relaxed mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Từ vựng quan trọng (collapsible) */}
        <div className="border-t border-gray-700/50">
          <button
            onClick={() => setShowVocab(!showVocab)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-indigo-400 hover:bg-gray-700/20 transition-colors"
          >
            <span>📚 Từ vựng quan trọng ({READING_PASSAGE.vocabulary.length})</span>
            {showVocab ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showVocab && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {READING_PASSAGE.vocabulary.map((v) => (
                <div
                  key={v.word}
                  className="relative flex items-center gap-2 px-3 py-2 bg-gray-700/40 rounded-xl cursor-pointer hover:bg-gray-700/60 transition-colors"
                  onMouseEnter={() => setHoveredWord(v.word)}
                  onMouseLeave={() => setHoveredWord(null)}
                  onTouchStart={() =>
                    setHoveredWord(hoveredWord === v.word ? null : v.word)
                  }
                >
                  <span className="text-sm font-medium text-white">{v.word}</span>
                  {hoveredWord === v.word && (
                    <div className="absolute bottom-full left-0 mb-1 px-2.5 py-1.5 bg-indigo-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
                      {v.meaning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Câu hỏi trắc nghiệm */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Câu hỏi hiểu bài
        </h3>

        {READING_PASSAGE.questions.map((q, qIdx) => {
          const userAnswer = answers[q.id]
          const isCorrect = checked && userAnswer === q.correctAnswer
          const isWrong = checked && userAnswer !== undefined && !isCorrect

          return (
            <div
              key={q.id}
              className={cn(
                'bg-gray-800/60 border rounded-2xl p-4 transition-colors',
                isCorrect
                  ? 'border-green-500/40 bg-green-900/10'
                  : isWrong
                  ? 'border-red-500/40 bg-red-900/10'
                  : 'border-gray-700/50'
              )}
            >
              <div className="flex items-start gap-2 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                  {qIdx + 1}
                </span>
                <p className="text-sm font-medium text-white">{q.question}</p>
                {checked && userAnswer !== undefined && (
                  <div className="ml-auto flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const optStr = String(optIdx)
                  const isSelected = userAnswer === optStr
                  const isThisCorrect = q.correctAnswer === optStr

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(q.id, optStr)}
                      data-selected={!checked && isSelected}
                      className={cn(
                        'answer-choice w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl',
                        'text-sm transition-all duration-150',
                        'border',
                        // Chưa check
                          !checked && isSelected
                          ? 'border-2 border-primary bg-accent text-accent-foreground'
                          : !checked
                          ? 'border-gray-700/50 bg-gray-700/30 text-gray-300 hover:border-gray-600'
                          : // Đã check
                          isThisCorrect
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : isSelected && !isThisCorrect
                          ? 'border-red-500 bg-red-500/20 text-red-300'
                          : 'border-gray-700/50 bg-gray-700/20 text-gray-500'
                      )}
                    >
                      <span
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          !checked && isSelected
                            ? 'answer-choice-marker bg-primary text-primary-foreground'
                            : checked && isThisCorrect
                            ? 'bg-green-500 text-white'
                            : checked && isSelected && !isThisCorrect
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-700 text-gray-400'
                        )}
                      >
                        {['A', 'B', 'C', 'D'][optIdx]}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>

              {/* Giải thích (sau khi check) */}
              {checked && (
                <div className="mt-3 px-3 py-2 bg-gray-700/30 rounded-xl">
                  <p className="text-xs text-gray-400">
                    💡 <span className="text-gray-300">{q.explanation}</span>
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Kết quả và nút action */}
      {checked ? (
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-5 text-center">
          <div className="text-4xl font-black text-white mb-1">
            {score}/{READING_PASSAGE.questions.length}
          </div>
          <p className="text-indigo-300 font-medium mb-1">
            {score === READING_PASSAGE.questions.length
              ? '🎉 Xuất sắc! Hoàn hảo!'
              : score >= READING_PASSAGE.questions.length * 0.7
              ? '👏 Tốt lắm!'
              : '💪 Cần ôn thêm nhé!'}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Đúng {score} / {READING_PASSAGE.questions.length} câu
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
          >
            Làm lại
          </button>
        </div>
      ) : (
        <button
          onClick={handleCheck}
          disabled={Object.keys(answers).length < READING_PASSAGE.questions.length}
          className={cn(
            'w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200',
            'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
            'hover:from-indigo-500 hover:to-purple-500',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          Kiểm tra đáp án ({Object.keys(answers).length}/{READING_PASSAGE.questions.length})
        </button>
      )}
    </div>
  )
}

// ========================
// Tab: Writing (Luyện viết)
// ========================
function WritingTab() {
  const [essay, setEssay] = useState('')
  const [isGrading, setIsGrading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Đếm từ
  const wordCount = essay.trim()
    ? essay.trim().split(/\s+/).filter(Boolean).length
    : 0
  const isUnderMin = wordCount < WRITING_PROMPT.wordLimit.min
  const isOverMax = wordCount > WRITING_PROMPT.wordLimit.max
  const isGoodLength = !isUnderMin && !isOverMax

  // Màu word count
  const wordCountColor = isOverMax
    ? 'text-red-400'
    : isGoodLength
    ? 'text-green-400'
    : 'text-gray-400'

  // ── Gửi bài để AI chấm ──
  const handleSubmit = async () => {
    if (!essay.trim() || wordCount < WRITING_PROMPT.wordLimit.min) return
    setIsGrading(true)
    setFeedback(null)

    try {
      const result = await gradeWriting(essay, WRITING_PROMPT.title, 'A1')
      setFeedback(result.data || result.errorMessage || 'Không thể chấm bài lúc này.')
    } catch {
      setFeedback('Lỗi kết nối. Vui lòng thử lại sau.')
    } finally {
      setIsGrading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Thẻ đề bài */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <PenLine className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{WRITING_PROMPT.title}</h2>
            <p className="text-xs text-amber-400/80 mt-0.5">{WRITING_PROMPT.titleVi}</p>
          </div>
        </div>

        <div className="px-4 py-4 space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed">
            {WRITING_PROMPT.description}
          </p>
          <p className="text-xs text-gray-500 italic">{WRITING_PROMPT.descriptionVi}</p>

          {/* Word limit */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30">
              <span className="text-xs text-indigo-300 font-medium">
                {WRITING_PROMPT.wordLimit.min}–{WRITING_PROMPT.wordLimit.max} từ
              </span>
            </div>
          </div>

          {/* Bài mẫu (collapsible) */}
          <button
            onClick={() => setShowSample(!showSample)}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            {showSample ? 'Ẩn bài mẫu' : 'Xem bài mẫu'}
          </button>
          {showSample && (
            <div className="px-3 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <p className="text-xs text-gray-400 mb-1 font-medium">Bài mẫu tham khảo:</p>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "{WRITING_PROMPT.sampleAnswer}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Textarea bài làm */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Bài làm của bạn:</label>
          <span className={cn('text-sm font-bold tabular-nums', wordCountColor)}>
            {wordCount} từ
            {isOverMax && ' (quá giới hạn)'}
            {isGoodLength && wordCount > 0 && ' ✓'}
          </span>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Write your essay here... (Viết bài của bạn tại đây...)"
            rows={8}
            className={cn(
              'w-full bg-gray-800/60 border rounded-2xl px-4 py-3',
              'text-white placeholder-gray-500 text-sm leading-relaxed',
              'resize-none outline-none transition-colors',
              isOverMax
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-gray-700/50 focus:border-indigo-500/60'
            )}
          />

          {/* Progress bar giới hạn từ */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isOverMax
                    ? 'bg-red-500'
                    : isGoodLength
                    ? 'bg-green-500'
                    : 'bg-indigo-500'
                )}
                style={{
                  width: `${Math.min(
                    100,
                    (wordCount / WRITING_PROMPT.wordLimit.max) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {isUnderMin && wordCount > 0 && (
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Cần thêm {WRITING_PROMPT.wordLimit.min - wordCount} từ nữa
          </p>
        )}
      </div>

      {/* Nút submit */}
      <button
        onClick={handleSubmit}
        disabled={isGrading || wordCount < WRITING_PROMPT.wordLimit.min || !essay.trim()}
        className={cn(
          'w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200',
          'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
          'hover:from-amber-400 hover:to-orange-400',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isGrading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI đang chấm bài...
          </>
        ) : (
          <>
            <Star className="w-4 h-4" />
            Nộp bài để AI chấm
          </>
        )}
      </button>

      {/* AI Feedback card */}
      {feedback && !isGrading && (
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-indigo-500/30 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700/50 bg-indigo-900/20">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white text-sm">Nhận xét từ AI Tutor</h3>
          </div>
          <div className="px-4 py-4">
            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
              {feedback}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ========================
// Trang chính ReadingWriting
// ========================
type Tab = 'reading' | 'writing'

export default function ReadingWriting() {
  const [activeTab, setActiveTab] = useState<Tab>('reading')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Tab selector ── */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-gray-800/50">
        <div className="flex gap-2 bg-gray-800/60 p-1 rounded-2xl">
          {(
            [
              { id: 'reading', label: 'Đọc', icon: BookOpen },
              { id: 'writing', label: 'Viết', icon: PenLine },
            ] as { id: Tab; label: string; icon: React.ElementType }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Nội dung tab ── */}
      <div className="px-4 py-5 pb-24">
        {activeTab === 'reading' ? <ReadingTab /> : <WritingTab />}
      </div>
    </div>
  )
}
