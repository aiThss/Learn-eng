/**
 * Onboarding - Luồng giới thiệu app cho người dùng mới
 * 4 bước: Chào mừng → Thông tin → Bài test → Kết quả & bắt đầu
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Zap,
  Target,
  Clock,
  Star,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createLocalId } from '@/lib/localId'
import { createInitialProgress, useLessonStore, useProgressStore, useUserStore } from '@/store'
import type { LearningPhase, User } from '@/types'
import { isGoogleOAuthConfigured, signInWithGoogle, type GoogleOAuthProfile } from '@/services/auth/googleOAuth'

// ========================
// Câu hỏi placement test
// ========================
interface PlacementQ {
  id: string
  skill: 'vocabulary' | 'grammar' | 'reading'
  question: string
  options: string[]
  correct: number
  level: LearningPhase
}

const PLACEMENT_QUESTIONS: PlacementQ[] = [
  {
    id: 'q1',
    skill: 'vocabulary',
    question: 'What does "beautiful" mean?',
    options: ['Xấu xí', 'Đẹp, xinh đẹp', 'To lớn', 'Nhỏ bé'],
    correct: 1,
    level: 'PHASE_0',
  },
  {
    id: 'q2',
    skill: 'grammar',
    question: 'Choose the correct sentence:',
    options: [
      'She go to school every day.',
      'She goes to school every day.',
      'She going to school every day.',
      'She gone to school every day.',
    ],
    correct: 1,
    level: 'PHASE_1',
  },
  {
    id: 'q3',
    skill: 'vocabulary',
    question: '"Environment" có nghĩa là gì?',
    options: ['Chính phủ', 'Giáo dục', 'Môi trường', 'Kinh tế'],
    correct: 2,
    level: 'PHASE_2',
  },
  {
    id: 'q4',
    skill: 'grammar',
    question: 'Which is correct? "I _____ English for 3 years."',
    options: ['study', 'studied', 'have studied', 'am studying'],
    correct: 2,
    level: 'PHASE_2',
  },
  {
    id: 'q5',
    skill: 'grammar',
    question: 'Choose the passive voice: "The cake _____ by Mary."',
    options: ['baked', 'was baked', 'is baking', 'bakes'],
    correct: 1,
    level: 'PHASE_3',
  },
  {
    id: 'q6',
    skill: 'vocabulary',
    question: 'Choose the best greeting for the morning:',
    options: ['Good night', 'Good morning', 'Goodbye', 'Thank you'],
    correct: 1,
    level: 'PHASE_0',
  },
  {
    id: 'q7',
    skill: 'grammar',
    question: 'I _____ a student.',
    options: ['am', 'is', 'are', 'be'],
    correct: 0,
    level: 'PHASE_0',
  },
  {
    id: 'q8',
    skill: 'vocabulary',
    question: 'Which word means “mua” in English?',
    options: ['Buy', 'Bring', 'Build', 'Borrow'],
    correct: 0,
    level: 'PHASE_1',
  },
  {
    id: 'q9',
    skill: 'grammar',
    question: 'There _____ two books on the table.',
    options: ['is', 'are', 'am', 'be'],
    correct: 1,
    level: 'PHASE_1',
  },
  {
    id: 'q10',
    skill: 'reading',
    question: 'Read: “Lan works in a bank. She starts work at 8 a.m.” Where does Lan work?',
    options: ['At a school', 'At a bank', 'At a hospital', 'At a restaurant'],
    correct: 1,
    level: 'PHASE_1',
  },
  {
    id: 'q11',
    skill: 'grammar',
    question: 'Look! The children _____ in the garden.',
    options: ['play', 'played', 'are playing', 'have played'],
    correct: 2,
    level: 'PHASE_1',
  },
  {
    id: 'q12',
    skill: 'vocabulary',
    question: 'A “passport” is most useful when you _____ .',
    options: ['cook dinner', 'travel abroad', 'go to sleep', 'read a book'],
    correct: 1,
    level: 'PHASE_2',
  },
  {
    id: 'q13',
    skill: 'grammar',
    question: 'Yesterday, we _____ dinner at home.',
    options: ['have', 'had', 'has', 'having'],
    correct: 1,
    level: 'PHASE_2',
  },
  {
    id: 'q14',
    skill: 'reading',
    question: 'Read: “Hi Mai, I am visiting Da Nang next weekend. The hotel is near the beach.” Where is the hotel?',
    options: ['Near the airport', 'Near the beach', 'Near a school', 'Near Mai’s house'],
    correct: 1,
    level: 'PHASE_2',
  },
  {
    id: 'q15',
    skill: 'grammar',
    question: 'This exercise is _____ than the last one.',
    options: ['easy', 'easier', 'easiest', 'more easy'],
    correct: 1,
    level: 'PHASE_2',
  },
  {
    id: 'q16',
    skill: 'vocabulary',
    question: '“Although” is used to show _____ .',
    options: ['a contrast', 'a number', 'a question', 'a location'],
    correct: 0,
    level: 'PHASE_3',
  },
  {
    id: 'q17',
    skill: 'grammar',
    question: 'If it rains tomorrow, we _____ at home.',
    options: ['stay', 'stayed', 'will stay', 'would stay'],
    correct: 2,
    level: 'PHASE_3',
  },
  {
    id: 'q18',
    skill: 'reading',
    question: 'Read: “The company introduced flexible hours so staff can begin earlier or later.” Why did the company change its hours?',
    options: ['To reduce salaries', 'To give staff more choice', 'To close earlier', 'To hire only new staff'],
    correct: 1,
    level: 'PHASE_3',
  },
  {
    id: 'q19',
    skill: 'grammar',
    question: 'I _____ my keys, so I cannot open the door.',
    options: ['lose', 'lost', 'have lost', 'was losing'],
    correct: 2,
    level: 'PHASE_3',
  },
  {
    id: 'q20',
    skill: 'vocabulary',
    question: 'A “reliable” colleague is someone you can _____ .',
    options: ['depend on', 'argue with', 'ignore', 'avoid'],
    correct: 0,
    level: 'PHASE_3',
  },
]

// A deliberate "I don't know" response makes the placement result more
// trustworthy than forcing learners to guess one of the four answers.
const I_DONT_KNOW_OPTION = 'Không biết / Chưa học phần này'

// Tính phase đề xuất dựa trên điểm test
function calcRecommendedPhase(score: number): LearningPhase {
  if (score <= 4) return 'PHASE_0'
  if (score <= 9) return 'PHASE_1'
  if (score <= 14) return 'PHASE_2'
  return 'PHASE_3'
}

const PHASE_LABELS: Record<LearningPhase, { level: string; name: string; emoji: string; desc: string }> = {
  PHASE_0: { level: 'A0', name: 'Làm quen', emoji: '🌱', desc: 'Bắt đầu từ những bước đầu tiên' },
  PHASE_1: { level: 'A1', name: 'Cơ bản', emoji: '📚', desc: 'Xây dựng nền tảng vững chắc' },
  PHASE_2: { level: 'A2', name: 'Trung cấp', emoji: '🚀', desc: 'Tiếp tục nâng cao trình độ' },
  PHASE_3: { level: 'B1', name: 'Khá', emoji: '🏆', desc: 'Hướng tới IELTS 4.5–5.5' },
}

const DAILY_GOAL_OPTIONS = [
  { minutes: 10, label: '10 phút', desc: 'Nhẹ nhàng' },
  { minutes: 15, label: '15 phút', desc: 'Vừa phải' },
  { minutes: 20, label: '20 phút', desc: 'Hiệu quả' },
  { minutes: 30, label: '30 phút', desc: 'Nghiêm túc' },
]

const AVATAR_EMOJIS = ['😊', '🧑‍🎓', '👩‍💻', '🦊', '🐼', '🦁', '🐨', '🦄', '🐸', '🦋']

// ========================
// Step 1: Chào mừng
// ========================
function WelcomeStep({
  onNext,
  onGoogleLogin,
  googleAvailable,
  isGoogleLoading,
  googleError,
}: {
  onNext: () => void
  onGoogleLogin: () => void
  googleAvailable: boolean
  isGoogleLoading: boolean
  googleError: string | null
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl scale-150" />
        <img
          src="/lumina-logo.png"
          alt="Lumina"
          className="relative h-28 w-28 rounded-[2rem] object-cover shadow-card"
        />
      </div>

      <h1 className="text-4xl font-black text-white mb-3 tracking-tight">EnglishUp</h1>
      <p className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
        Học tiếng Anh thông minh
      </p>
      <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
        Lộ trình A0 → B1 khoa học, kết hợp AI và phương pháp SRS để bạn tiến bộ nhanh chóng.
      </p>

      {/* Feature list */}
      <div className="w-full mt-8 space-y-3">
        {[
          { icon: BookOpen, text: 'Lộ trình 28 tuần có cấu trúc', color: 'text-blue-400' },
          { icon: Zap, text: 'SRS thông minh – nhớ lâu hơn', color: 'text-purple-400' },
          { icon: Target, text: 'AI luyện nói & chấm bài tự động', color: 'text-pink-400' },
          { icon: Star, text: 'Ước tính IELTS theo thời gian thực', color: 'text-amber-400' },
        ].map(({ icon: Icon, text, color }, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3"
          >
            <Icon className={cn('w-5 h-5 flex-shrink-0', color)} />
            <span className="text-sm font-medium text-gray-300">{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        Bắt đầu
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={isGoogleLoading}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-600 bg-white px-4 py-3.5 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60"
      >
        {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-lg font-black text-[#4285F4]">G</span>}
        {isGoogleLoading ? 'Đang mở Google…' : 'Đăng nhập với Google'}
      </button>
      <p className={cn('mt-2 text-xs', googleAvailable ? 'text-gray-500' : 'text-amber-500')}>
        {googleAvailable ? 'Miễn phí · Không cần mật khẩu' : 'Google OAuth đang chờ cấu hình trên máy chủ'}
      </p>
      {googleError && <p className="mt-2 text-center text-xs text-red-400">{googleError}</p>}
    </div>
  )
}

// ========================
// Step 2: Thông tin người dùng
// ========================
function UserInfoStep({
  name,
  avatar,
  onNameChange,
  onAvatarChange,
  onNext,
  onBack,
}: {
  name: string
  avatar: string
  onNameChange: (v: string) => void
  onAvatarChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const avatarIsImage = /^https?:\/\//.test(avatar)

  return (
    <div className="flex flex-col flex-1 px-5">
      <h2 className="text-2xl font-black text-white mb-1">Giới thiệu bản thân</h2>
      <p className="text-gray-400 text-sm mb-8">Chọn avatar và nhập tên để cá nhân hóa</p>

      {/* Avatar lớn hiện tại */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gray-800 border-2 border-indigo-500/50 flex items-center justify-center text-5xl shadow-lg">
          {avatarIsImage ? <img src={avatar} alt="Google profile" className="h-full w-full rounded-3xl object-cover" /> : avatar}
        </div>
      </div>

      {/* Avatar picker grid */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {AVATAR_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onAvatarChange(emoji)}
            className={cn(
              'aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all',
              avatar === emoji
                ? 'bg-indigo-500/30 border-2 border-indigo-500 scale-110'
                : 'bg-gray-800/60 border border-gray-700/40 hover:border-gray-600'
            )}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Name input */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-300 mb-2">Tên của bạn</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nhập tên..."
          className={cn(
            'w-full bg-gray-800/60 border rounded-xl px-4 py-3.5',
            'text-white placeholder-gray-500 text-base font-medium',
            'border-gray-700/50 focus:border-indigo-500/60 focus:outline-none transition-colors'
          )}
        />
      </div>

      <div className="mt-auto flex gap-3">
        <button
          onClick={onBack}
          className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700/50 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={onNext}
          disabled={!name.trim()}
          className={cn(
            'flex-1 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
            name.trim()
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          )}
        >
          Tiếp tục <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// ========================
// Step 3: Mini placement test
// ========================
function PlacementTestStep({
  answers,
  onAnswer,
  onNext,
  onBack,
}: {
  answers: Record<string, number>
  onAnswer: (id: string, idx: number) => void
  onNext: () => void
  onBack: () => void
}) {
  const [currentQ, setCurrentQ] = useState(0)
  const question = PLACEMENT_QUESTIONS[currentQ]
  const options = [...question.options, I_DONT_KNOW_OPTION]
  const isLastQ = currentQ === PLACEMENT_QUESTIONS.length - 1
  const hasAnswered = answers[question.id] !== undefined

  const handleNext = () => {
    if (isLastQ) {
      onNext()
    } else {
      setCurrentQ((c) => c + 1)
    }
  }

  return (
    <div className="flex flex-col flex-1 px-5">
      {/* Header progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            {question.skill === 'vocabulary'
              ? '📖 Từ vựng'
              : question.skill === 'grammar'
                ? '⚡ Ngữ pháp'
                : '📄 Đọc hiểu'}
          </p>
          <span className="text-xs text-gray-400">
            {currentQ + 1}/{PLACEMENT_QUESTIONS.length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {PLACEMENT_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all',
                i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-indigo-500' : 'bg-gray-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* Câu hỏi */}
      <div className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-5 mb-6">
        <h3 className="text-base font-bold text-white leading-snug">{question.question}</h3>
      </div>

      {/* Options A–D plus an explicit non-guessing answer. Index 4 is never correct. */}
      <div className="space-y-3 flex-1">
        {options.map((opt, oi) => {
          const isSelected = answers[question.id] === oi
          return (
            <button
              key={oi}
              onClick={() => onAnswer(question.id, oi)}
              data-selected={isSelected}
              className={cn(
                'answer-choice w-full text-left p-4 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]',
                isSelected
                  ? 'border-2 border-primary bg-accent text-accent-foreground shadow-card'
                  : 'border-border bg-card text-foreground hover:border-border-strong hover:bg-muted'
              )}
            >
              <span className="mr-3 text-xs opacity-60 font-bold">
                {String.fromCharCode(65 + oi)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        Chọn E nếu chưa biết — câu này sẽ không được tính đúng.
      </p>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => (currentQ > 0 ? setCurrentQ((c) => c - 1) : onBack())}
          className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700/50 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswered}
          className={cn(
            'flex-1 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
            hasAnswered
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          )}
        >
          {isLastQ ? 'Xem kết quả' : 'Câu tiếp theo'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// ========================
// Step 4: Kết quả + cài đặt
// ========================
function ResultStep({
  recommendedPhase,
  testScore,
  dailyGoal,
  onDailyGoalChange,
  onStart,
}: {
  recommendedPhase: LearningPhase
  testScore: number
  dailyGoal: number
  onDailyGoalChange: (v: number) => void
  onStart: () => void
}) {
  const phaseInfo = PHASE_LABELS[recommendedPhase]

  return (
    <div className="flex flex-col flex-1 px-5">
      {/* Kết quả */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/30">
          <span className="text-4xl">{phaseInfo.emoji}</span>
        </div>
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
          Kết quả bài kiểm tra
        </p>
        <h2 className="text-2xl font-black text-white mb-1">
          {phaseInfo.level} · {phaseInfo.name}
        </h2>
        <p className="text-gray-400 text-sm">{phaseInfo.desc}</p>
        <div className="inline-flex items-center gap-2 mt-3 bg-gray-800/60 border border-gray-700/40 rounded-full px-4 py-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-bold text-white">
            {testScore}/{PLACEMENT_QUESTIONS.length} câu đúng
          </span>
        </div>
      </div>

      {/* Phase roadmap mini */}
      <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-2xl p-4 mb-6">
        <p className="text-xs font-bold text-indigo-400 mb-2">📋 LỘ TRÌNH ĐỀ XUẤT</p>
        {(Object.entries(PHASE_LABELS) as [LearningPhase, typeof PHASE_LABELS[LearningPhase]][]).map(
          ([key, info], i, arr) => {
            const isRec = key === recommendedPhase
            return (
              <div
                key={key}
                className={cn(
                  'flex items-center gap-3 py-2',
                  i < arr.length - 1 && 'border-b border-gray-700/30'
                )}
              >
                <span className="text-lg">{info.emoji}</span>
                <span className={cn('text-xs font-bold flex-1', isRec ? 'text-white' : 'text-gray-500')}>
                  {info.level} · {info.name}
                </span>
                {isRec && (
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    BẮT ĐẦU ĐÂY
                  </span>
                )}
              </div>
            )
          }
        )}
      </div>

      {/* Daily goal picker */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Mục tiêu học mỗi ngày</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DAILY_GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.minutes}
              onClick={() => onDailyGoalChange(opt.minutes)}
              className={cn(
                'p-4 rounded-xl border text-center transition-all active:scale-95',
                dailyGoal === opt.minutes
                  ? 'border-indigo-500/60 bg-indigo-500/20'
                  : 'border-gray-700/40 bg-gray-800/40 hover:border-gray-600'
              )}
            >
              <p className={cn('text-xl font-black', dailyGoal === opt.minutes ? 'text-white' : 'text-gray-300')}>
                {opt.label}
              </p>
              <p className={cn('text-xs mt-0.5', dailyGoal === opt.minutes ? 'text-indigo-400' : 'text-gray-500')}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Bắt đầu */}
      <button
        onClick={onStart}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-transform"
      >
        Bắt đầu học ngay! 🚀
      </button>
    </div>
  )
}

// ========================
// Onboarding page chính
// ========================
export default function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useUserStore()
  const { setProgress } = useProgressStore()
  const { setPhase, setWeek } = useLessonStore()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('😊')
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({})
  const [dailyGoal, setDailyGoal] = useState(15)
  const [googleProfile, setGoogleProfile] = useState<GoogleOAuthProfile | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  // Tính điểm test
  const testScore = PLACEMENT_QUESTIONS.filter(
    (q) => testAnswers[q.id] === q.correct
  ).length

  const recommendedPhase = calcRecommendedPhase(testScore)

  const handleAnswer = (id: string, idx: number) => {
    setTestAnswers((prev) => ({ ...prev, [id]: idx }))
  }

  const handleGoogleLogin = async () => {
    setGoogleError(null)
    if (!isGoogleOAuthConfigured()) {
      setGoogleError('Google OAuth chưa được cấu hình trên máy chủ. Thêm VITE_GOOGLE_CLIENT_ID rồi deploy lại.')
      return
    }

    setIsGoogleLoading(true)
    try {
      const profile = await signInWithGoogle()
      setGoogleProfile(profile)
      setName(profile.name)
      if (profile.avatar) setAvatar(profile.avatar)
      setStep(1)
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : 'Không thể đăng nhập Google.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Lưu user và điều hướng về Dashboard
  const handleStart = () => {
    const newUser: User = {
      id: googleProfile?.id ?? createLocalId(),
      name: name.trim() || googleProfile?.name || 'Bạn',
      email: googleProfile?.email,
      avatar: googleProfile?.avatar ?? avatar,
      authProvider: googleProfile ? 'google' : 'local',
      createdAt: new Date(),
      currentPhase: recommendedPhase,
      currentWeek: 1,
      targetScore: 'IELTS',
      learningMode: 'QUICK',
      dailyGoalMinutes: dailyGoal,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    // Gọi completeOnboarding() để lưu user và set isOnboarded = true
    completeOnboarding(newUser)
    setProgress(createInitialProgress(newUser.id))
    setPhase(recommendedPhase)
    setWeek(1)

    // Điều hướng về Dashboard
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Step progress dots (ẩn ở bước 0) */}
      {step > 0 && (
        <div className="flex items-center justify-center gap-2 pt-14 pb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'rounded-full transition-all duration-300',
                s === step ? 'w-6 h-2 bg-indigo-500' : s < step ? 'w-2 h-2 bg-green-500' : 'w-2 h-2 bg-gray-700'
              )}
            />
          ))}
        </div>
      )}

      {/* Padding top cho bước 0 */}
      {step === 0 && <div className="pt-16" />}

      {/* Nội dung từng bước */}
      <div className="flex flex-col flex-1 pb-8">
        {step === 0 && (
          <WelcomeStep
            onNext={() => setStep(1)}
            onGoogleLogin={() => void handleGoogleLogin()}
            googleAvailable={isGoogleOAuthConfigured()}
            isGoogleLoading={isGoogleLoading}
            googleError={googleError}
          />
        )}
        {step === 1 && (
          <UserInfoStep
            name={name}
            avatar={avatar}
            onNameChange={setName}
            onAvatarChange={setAvatar}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <PlacementTestStep
            answers={testAnswers}
            onAnswer={handleAnswer}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <ResultStep
            recommendedPhase={recommendedPhase}
            testScore={testScore}
            dailyGoal={dailyGoal}
            onDailyGoalChange={setDailyGoal}
            onStart={handleStart}
          />
        )}
      </div>
    </div>
  )
}
