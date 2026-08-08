/**
 * Trang Nghe - Listening Practice
 * Audio player UI, transcript toggle, câu hỏi, chấm điểm
 */
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, Eye, EyeOff, ChevronDown, CheckCircle2, XCircle, SkipBack, SkipForward, Headphones } from 'lucide-react'
import type { ListeningExercise, ListeningQuestion } from '@/types'
import { useProgressStore } from '@/store'
import { cn } from '@/lib/utils'

// ========================
// DỮ LIỆU MẪU BÀI NGHE
// ========================
const LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: 'l001',
    title: 'Chào hỏi cơ bản',
    audioUrl: '', // Demo - không có audio thật
    transcript: `A: Hello! How are you today?
B: Hi! I'm fine, thank you. And you?
A: I'm good too, thanks! My name is Anna. What's your name?
B: My name is Tom. Nice to meet you, Anna!
A: Nice to meet you too, Tom! Where are you from?
B: I'm from Vietnam. And you?
A: I'm from England. Do you speak English well?
B: A little. I'm learning English now.
A: That's great! Keep practising!`,
    questions: [
      {
        id: 'q001',
        question: 'What is the woman\'s name?',
        options: ['Tom', 'Anna', 'Mary', 'Lisa'],
        correctAnswer: 1,
        explanation: 'She said "My name is Anna"',
      },
      {
        id: 'q002',
        question: 'Where is Tom from?',
        options: ['England', 'America', 'Vietnam', 'Japan'],
        correctAnswer: 2,
        explanation: 'Tom said "I\'m from Vietnam"',
      },
      {
        id: 'q003',
        question: 'What is Tom doing now?',
        options: ['Working', 'Sleeping', 'Learning English', 'Watching TV'],
        correctAnswer: 2,
        explanation: 'Tom said "I\'m learning English now"',
      },
    ],
    difficulty: 'PHASE_0',
    duration: 45,
    topic: 'Greeting',
  },
  {
    id: 'l002',
    title: 'Gọi đồ ăn tại nhà hàng',
    audioUrl: '',
    transcript: `Waiter: Good evening! Welcome to Green Garden Restaurant. 
Customer: Good evening! A table for two, please.
Waiter: Of course! Please follow me. Here is your menu.
Customer: Thank you. Can I have the chicken soup, please?
Waiter: Certainly! And what would you like to drink?
Customer: A glass of water, please.
Waiter: Anything else?
Customer: No, that's all. How much is it?
Waiter: The chicken soup is ten dollars. The water is free.
Customer: Great, thank you very much!
Waiter: You're welcome. Enjoy your meal!`,
    questions: [
      {
        id: 'q004',
        question: 'Where does this conversation take place?',
        options: ['A hotel', 'A restaurant', 'A school', 'A market'],
        correctAnswer: 1,
        explanation: 'The waiter said "Welcome to Green Garden Restaurant"',
      },
      {
        id: 'q005',
        question: 'What did the customer order to eat?',
        options: ['Pizza', 'Chicken soup', 'Steak', 'Salad'],
        correctAnswer: 1,
        explanation: 'The customer said "Can I have the chicken soup"',
      },
      {
        id: 'q006',
        question: 'How much does the chicken soup cost?',
        options: ['$5', '$8', '$10', '$15'],
        correctAnswer: 2,
        explanation: 'The waiter said "The chicken soup is ten dollars"',
      },
    ],
    difficulty: 'PHASE_0',
    duration: 60,
    topic: 'Restaurant',
  },
]

// ========================
// TYPES
// ========================
type PlaybackSpeed = 0.5 | 1 | 1.5
type ExerciseResult = { answers: Record<string, number>; submitted: boolean; score: number }

// ========================
// AUDIO PLAYER COMPONENT
// ========================
interface AudioPlayerProps {
  audioUrl: string
  duration: number
  speed: PlaybackSpeed
  onSpeedChange: (s: PlaybackSpeed) => void
}

function AudioPlayer({ audioUrl, duration, speed, onSpeedChange }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Cập nhật tốc độ phát
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }, [speed])

  // Cập nhật thời gian hiện tại
  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handlePlayPause = async () => {
    if (!audioRef.current) return

    // Demo mode - không có audio thật nên mô phỏng
    if (!audioUrl) {
      setIsPlaying(prev => !prev)
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      await audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) audioRef.current.currentTime = time
  }

  // Mô phỏng tiến độ trong demo mode
  useEffect(() => {
    if (!audioUrl && isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + speed
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, audioUrl, duration, speed])

  // Format thời gian mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="rounded-2xl bg-gray-800 p-5">
      {/* Audio element ẩn */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Icon + trạng thái */}
      <div className="mb-4 flex items-center justify-center">
        <div className={cn(
          'flex h-16 w-16 items-center justify-center rounded-full transition-all',
          isPlaying
            ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50 animate-pulse'
            : 'bg-gray-700'
        )}>
          <Volume2 className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-600 accent-indigo-500"
          style={{
            background: `linear-gradient(to right, #6366f1 ${progress}%, #4b5563 ${progress}%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Rewind 10s */}
        <button
          onClick={() => setCurrentTime(prev => Math.max(0, prev - 10))}
          className="rounded-lg bg-gray-700 p-2 text-gray-300 transition-colors hover:bg-gray-600"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 transition-all hover:bg-indigo-700 active:scale-95"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
        </button>

        {/* Forward 10s */}
        <button
          onClick={() => setCurrentTime(prev => Math.min(duration, prev + 10))}
          className="rounded-lg bg-gray-700 p-2 text-gray-300 transition-colors hover:bg-gray-600"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* Speed selector */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-500">Tốc độ:</span>
        {([0.5, 1, 1.5] as PlaybackSpeed[]).map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              'rounded-lg px-3 py-1 text-sm font-medium transition-colors',
              speed === s ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-foreground'
            )}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Demo notice */}
      {!audioUrl && (
        <p className="mt-3 text-center text-xs text-gray-600">
          * Demo mode - không có audio thật
        </p>
      )}
    </div>
  )
}

// ========================
// CÂUHỎI COMPONENT
// ========================
interface QuestionItemProps {
  question: ListeningQuestion
  selectedAnswer?: number
  submitted: boolean
  onSelect: (index: number) => void
}

function QuestionItem({ question, selectedAnswer, submitted, onSelect }: QuestionItemProps) {
  return (
    <div className="rounded-xl bg-gray-800 p-4">
      <p className="mb-3 font-medium text-white">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === i
          const isCorrect = question.correctAnswer === i
          let optionStyle = 'bg-gray-700 text-gray-300 hover:bg-gray-600'

          if (submitted) {
            if (isCorrect) optionStyle = 'bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-600'
            else if (isSelected && !isCorrect) optionStyle = 'bg-red-900/40 text-red-300 ring-1 ring-red-600'
            else optionStyle = 'bg-gray-700/50 text-gray-500'
          } else if (isSelected) {
            optionStyle = 'bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500'
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && onSelect(i)}
              disabled={submitted}
              data-selected={!submitted && isSelected}
              className={cn('answer-choice flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-all', optionStyle)}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-600 text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {submitted && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />}
              {submitted && isSelected && !isCorrect && <XCircle className="ml-auto h-4 w-4 text-red-400" />}
            </button>
          )
        })}
      </div>
      {/* Giải thích sau khi nộp */}
      {submitted && (
        <p className="mt-3 rounded-lg bg-gray-700/50 px-3 py-2 text-xs text-gray-400">
          💡 {question.explanation}
        </p>
      )}
    </div>
  )
}

// ========================
// TRANG CHÍNH
// ========================
export default function ListeningPage() {
  const { updateTodayActivity } = useProgressStore()

  const [selectedExercise, setSelectedExercise] = useState<ListeningExercise>(LISTENING_EXERCISES[0])
  const [showTranscript, setShowTranscript] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [result, setResult] = useState<ExerciseResult>({ answers: {}, submitted: false, score: 0 })

  // Nộp bài
  const handleSubmit = () => {
    let correct = 0
    selectedExercise.questions.forEach(q => {
      if (result.answers[q.id] === q.correctAnswer) correct++
    })
    const score = Math.round((correct / selectedExercise.questions.length) * 100)
    setResult(prev => ({ ...prev, submitted: true, score }))
    updateTodayActivity({ listeningMinutes: Math.round(selectedExercise.duration / 60) })
  }

  // Đổi bài → reset
  const handleSelectExercise = (ex: ListeningExercise) => {
    setSelectedExercise(ex)
    setResult({ answers: {}, submitted: false, score: 0 })
    setShowTranscript(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="mx-auto max-w-lg px-4 pt-4">

        {/* ===== HEADER ===== */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-purple-600/20 p-2">
            <Headphones className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Luyện Nghe</h1>
            <p className="text-sm text-gray-400">Chọn bài nghe để luyện tập</p>
          </div>
        </div>

        {/* ===== CHỌN BÀI ===== */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {LISTENING_EXERCISES.map(ex => (
            <button
              key={ex.id}
              onClick={() => handleSelectExercise(ex)}
              className={cn(
                'rounded-xl p-3 text-left transition-all ring-1',
                selectedExercise.id === ex.id
                  ? 'bg-purple-600/20 ring-purple-500/60'
                  : 'bg-gray-800 ring-gray-700/50 hover:bg-gray-700'
              )}
            >
              <p className="text-sm font-semibold text-white">{ex.title}</p>
              <p className="mt-1 text-xs text-gray-400">{ex.topic} · {ex.duration}s</p>
            </button>
          ))}
        </div>

        {/* ===== AUDIO PLAYER ===== */}
        <div className="mb-4">
          <h2 className="mb-3 font-semibold text-white">{selectedExercise.title}</h2>
          <AudioPlayer
            audioUrl={selectedExercise.audioUrl}
            duration={selectedExercise.duration}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>

        {/* ===== TRANSCRIPT TOGGLE ===== */}
        <div className="mb-4">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex w-full items-center justify-between rounded-xl bg-gray-800 px-4 py-3 transition-colors hover:bg-gray-700"
          >
            <div className="flex items-center gap-2">
              {showTranscript ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              <span className="text-sm font-medium text-white">
                {showTranscript ? 'Ẩn transcript' : 'Xem transcript'}
              </span>
            </div>
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', showTranscript && 'rotate-180')} />
          </button>
          {showTranscript && (
            <div className="mt-2 rounded-xl bg-gray-800/50 p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 font-sans">
                {selectedExercise.transcript}
              </pre>
            </div>
          )}
        </div>

        {/* ===== CÂU HỎI ===== */}
        <div className="mb-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Câu hỏi ({selectedExercise.questions.length} câu)
          </p>
          <div className="space-y-3">
            {selectedExercise.questions.map(q => (
              <QuestionItem
                key={q.id}
                question={q}
                selectedAnswer={result.answers[q.id]}
                submitted={result.submitted}
                onSelect={(idx) => setResult(prev => ({
                  ...prev,
                  answers: { ...prev.answers, [q.id]: idx }
                }))}
              />
            ))}
          </div>
        </div>

        {/* ===== NỘP BÀI / ĐIỂM SỐ ===== */}
        {!result.submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(result.answers).length < selectedExercise.questions.length}
            className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            Nộp bài ({Object.keys(result.answers).length}/{selectedExercise.questions.length} câu)
          </button>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-6 text-center ring-1 ring-purple-700/50">
            <div className="mb-2 text-4xl font-bold text-white">{result.score}%</div>
            <p className="mb-4 text-gray-300">
              {result.score === 100 ? '🎉 Perfect! Xuất sắc!' :
               result.score >= 66 ? '👍 Làm tốt lắm!' :
               '📚 Hãy nghe lại và thử lại!'}
            </p>
            <button
              onClick={() => setResult({ answers: {}, submitted: false, score: 0 })}
              className="rounded-xl bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Làm lại
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
