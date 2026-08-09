/**
 * Trang Nói - Speaking Practice
 * Ghi âm bằng Web Speech API, AI chấm điểm từ Gemini
 */
import { useState, useCallback, useRef } from 'react'
import { Mic, MicOff, Square, Loader2, Sparkles, AlertCircle, ChevronRight, MessageSquare } from 'lucide-react'
import { gradeSpeaking } from '@/services/ai/gemini'
import type { SpeakingTopic } from '@/types'
import { useProgressStore } from '@/store'
import { cn } from '@/lib/utils'

// ========================
// DỮ LIỆU CHỦ ĐỀ NÓI CHUYỆN MẪU
// ========================
const SPEAKING_TOPICS: SpeakingTopic[] = [
  {
    id: 's001',
    topic: 'Introduce Yourself',
    topicVi: 'Tự giới thiệu bản thân',
    prompt: 'Please introduce yourself: your name, age, job/study, and hobbies.',
    promptVi: 'Hãy tự giới thiệu về bản thân: tên, tuổi, công việc/học tập và sở thích của bạn.',
    sampleAnswer: "Hello! My name is [Your name]. I am [age] years old. I am a student. I study English every day. My hobby is reading books and watching movies. Nice to meet you!",
    keywords: ['name', 'age', 'student', 'hobby', 'reading'],
    difficulty: 'PHASE_0',
  },
  {
    id: 's002',
    topic: 'Daily Routine',
    topicVi: 'Thói quen hằng ngày',
    prompt: 'Describe your typical day from morning to evening.',
    promptVi: 'Mô tả một ngày bình thường của bạn từ sáng đến tối.',
    sampleAnswer: "I wake up at 6am every morning. I brush my teeth and have breakfast. Then I go to school or work. In the evening, I study English and watch TV. I go to bed at 10pm.",
    keywords: ['wake up', 'breakfast', 'school', 'evening', 'sleep'],
    difficulty: 'PHASE_0',
  },
  {
    id: 's003',
    topic: 'My Family',
    topicVi: 'Gia đình của tôi',
    prompt: 'Talk about your family members and their jobs.',
    promptVi: 'Hãy kể về các thành viên trong gia đình và công việc của họ.',
    sampleAnswer: "My family has four members. My father is a doctor. My mother is a teacher. I have one sister. She is a student. We live together in Hanoi. We are very happy.",
    keywords: ['father', 'mother', 'sister', 'brother', 'family'],
    difficulty: 'PHASE_0',
  },
]

// ========================
// TYPES
// ========================
type RecordingState = 'idle' | 'recording' | 'processing' | 'done'

interface SpeakingFeedback {
  rawText: string
  isFallback: boolean
}

// ========================
// TOPIC CARD COMPONENT
// ========================
interface TopicCardProps {
  topic: SpeakingTopic
  isActive: boolean
  onClick: () => void
}

function TopicCard({ topic, isActive, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl p-4 text-left transition-all ring-1',
        isActive
          ? 'bg-rose-600/20 ring-rose-500/60'
          : 'bg-gray-800 ring-gray-700/50 hover:bg-gray-700'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">{topic.topicVi}</p>
          <p className="text-xs text-gray-400">{topic.topic}</p>
        </div>
        <ChevronRight className={cn('h-4 w-4 transition-colors', isActive ? 'text-rose-400' : 'text-gray-600')} />
      </div>
    </button>
  )
}

// ========================
// TRANG CHÍNH
// ========================
export default function SpeakingPage() {
  const { todayActivity, updateTodayActivity } = useProgressStore()

  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic>(SPEAKING_TOPICS[0])
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<number | null>(null)

  // Khởi tạo Web Speech API
  const initRecognition = useCallback(() => {
    // Kiểm tra browser hỗ trợ Web Speech API
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return null

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'        // Nhận diện tiếng Anh
    recognition.interimResults = true  // Hiển thị kết quả tạm thời
    recognition.maxAlternatives = 1

    // Cập nhật transcript khi có kết quả
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          finalTranscript += t
        } else {
          interimTranscript += t
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onerror = () => {
      setRecordingState('idle')
      stopTimer()
    }

    recognition.onend = () => {
      // Khi speech recognition kết thúc tự động
      if (recordingState === 'recording') {
        setRecordingState('processing')
      }
    }

    return recognition
  }, [recordingState])

  // Timer đếm thời gian ghi âm
  const startTimer = () => {
    setRecordingTime(0)
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Bắt đầu ghi âm
  const handleStartRecording = () => {
    setTranscript('')
    setFeedback(null)
    setAiError(null)

    const recognition = initRecognition()

    if (!recognition) {
      // Fallback nếu browser không hỗ trợ
      setTranscript('(Browser này không hỗ trợ Web Speech API. Vui lòng dùng Chrome.)')
      return
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecordingState('recording')
    startTimer()
  }

  // Dừng ghi âm
  const handleStopRecording = () => {
    stopTimer()
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setRecordingState('processing')

    // Tự động xử lý sau khi dừng
    setTimeout(() => {
      setRecordingState('done')
    }, 500)
  }

  // Gọi AI chấm điểm
  const handleGetFeedback = async () => {
    if (!transcript.trim()) return

    setRecordingState('processing')
    setAiError(null)

    try {
      const result = await gradeSpeaking(transcript, selectedTopic.topic, 'A1')

      if (result.data) {
        // A transcript can support content/grammar feedback, but it contains no
        // acoustic evidence for a pronunciation score. Keep the AI response as
        // prose instead of fabricating numeric sub-scores.
        setFeedback({ rawText: result.data, isFallback: Boolean(result.isFallback) })
        updateTodayActivity({
          speakingMinutes: (todayActivity?.speakingMinutes ?? 0) + Math.max(1, Math.round(recordingTime / 60)),
        })
      } else {
        setAiError(result.errorMessage ?? 'Không thể nhận feedback từ AI')
        setFeedback({
          rawText: 'Chưa thể tạo phản hồi chi tiết. Bạn có thể đọc lại transcript, so sánh với câu mẫu và thử nói lại chậm hơn.',
          isFallback: true,
        })
      }
    } catch {
      setAiError('Lỗi kết nối')
      setFeedback({
        rawText: 'Chưa thể tạo phản hồi chi tiết. Bạn có thể đọc lại transcript, so sánh với câu mẫu và thử nói lại chậm hơn.',
        isFallback: true,
      })
    } finally {
      setRecordingState('done')
    }
  }

  // Đặt lại để ghi âm lại
  const handleReset = () => {
    setRecordingState('idle')
    setTranscript('')
    setFeedback(null)
    setAiError(null)
    setRecordingTime(0)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="mx-auto max-w-lg px-4 pt-4">

        {/* ===== HEADER ===== */}
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-rose-600/20 p-2">
            <Mic className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Luyện Nói</h1>
            <p className="text-sm text-gray-400">Nói tiếng Anh và nhận feedback từ AI</p>
          </div>
        </div>

        {/* ===== CHỌN CHỦ ĐỀ ===== */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Chọn chủ đề</p>
          <div className="space-y-2">
            {SPEAKING_TOPICS.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isActive={topic.id === selectedTopic.id}
                onClick={() => {
                  setSelectedTopic(topic)
                  handleReset()
                }}
              />
            ))}
          </div>
        </div>

        {/* ===== TOPIC CARD - CHỦ ĐỀ HIỆN TẠI ===== */}
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-rose-900/30 to-pink-900/30 p-5 ring-1 ring-rose-700/50">
          <div className="mb-1 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Đề bài</span>
          </div>
          <h2 className="mb-2 text-lg font-bold text-white">{selectedTopic.topicVi}</h2>
          <p className="mb-3 text-sm text-gray-300">{selectedTopic.promptVi}</p>
          <p className="text-xs italic text-gray-500">Prompt: {selectedTopic.prompt}</p>

          {/* Từ khóa gợi ý */}
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500">Từ khóa: </span>
            {selectedTopic.keywords.map(kw => (
              <span key={kw} className="rounded-full bg-rose-900/40 px-2 py-0.5 text-xs text-rose-300">
                {kw}
              </span>
            ))}
          </div>

          {/* Câu trả lời mẫu */}
          <button
            onClick={() => setShowSample(!showSample)}
            className="mt-3 text-xs text-rose-400 underline underline-offset-2"
          >
            {showSample ? 'Ẩn câu mẫu' : 'Xem câu trả lời mẫu'}
          </button>
          {showSample && (
            <p className="mt-2 rounded-lg bg-black/20 p-3 text-sm italic text-gray-400">
              "{selectedTopic.sampleAnswer}"
            </p>
          )}
        </div>

        {/* ===== NÚT GHI ÂM LỚN ===== */}
        <div className="mb-6 flex flex-col items-center">
          {recordingState === 'idle' && (
            <button
              onClick={handleStartRecording}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-600 text-white shadow-2xl shadow-rose-900/50 transition-all hover:bg-rose-700 hover:scale-105 active:scale-95"
            >
              <Mic className="h-10 w-10" />
            </button>
          )}

          {recordingState === 'recording' && (
            <>
              {/* Hiệu ứng sóng âm khi ghi */}
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
                <button
                  onClick={handleStopRecording}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-900/50 transition-all hover:bg-red-700 active:scale-95"
                >
                  <Square className="h-10 w-10" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-400">
                  Đang ghi âm... {recordingTime}s
                </span>
              </div>
            </>
          )}

          {recordingState === 'processing' && (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-700">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
            </div>
          )}

          {recordingState === 'done' && (
            <button
              onClick={handleReset}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-700 text-white transition-all hover:bg-gray-600 hover:scale-105"
            >
              <MicOff className="h-10 w-10 text-gray-400" />
            </button>
          )}

          <p className="mt-3 text-sm text-gray-500">
            {recordingState === 'idle' && 'Nhấn để bắt đầu nói'}
            {recordingState === 'recording' && 'Nhấn để dừng'}
            {recordingState === 'processing' && 'Đang xử lý...'}
            {recordingState === 'done' && 'Nhấn để ghi lại'}
          </p>
        </div>

        {/* ===== TRANSCRIPT - KẾT QUẢ NHẬN DẠNG ===== */}
        {transcript && (
          <div className="mb-4 rounded-xl bg-gray-800 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Bạn đã nói:
            </p>
            <p className="text-white leading-relaxed">"{transcript}"</p>
          </div>
        )}

        {/* ===== NÚT LẤY AI FEEDBACK ===== */}
        {recordingState === 'done' && transcript && !feedback && (
          <button
            onClick={handleGetFeedback}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white hover:from-violet-700 hover:to-indigo-700"
          >
            <Sparkles className="h-5 w-5" />
            Nhận AI Feedback
          </button>
        )}

        {/* Error */}
        {aiError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-900/20 p-4 ring-1 ring-red-700/50">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{aiError}</p>
          </div>
        )}

        {/* ===== AI FEEDBACK CARD ===== */}
        {feedback && (
          <div className="rounded-2xl bg-gray-900 p-5 ring-1 ring-gray-700/50">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <h3 className="font-bold text-white">Phản hồi cho transcript</h3>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-gray-400">
              Nhận xét này dựa trên phần chữ được nhận diện. Ứng dụng không chấm điểm phát âm khi không có phân tích âm thanh.
            </p>
            <p className="whitespace-pre-line rounded-xl bg-black/20 p-3 text-sm leading-relaxed text-gray-200">
              {feedback.rawText}
            </p>
            {feedback.isFallback && (
              <p className="mt-3 text-xs text-amber-300">Đây là gợi ý ngoại tuyến, không phải điểm đánh giá.</p>
            )}

            {/* Nút thử lại */}
            <button
              onClick={handleReset}
              className="mt-4 w-full rounded-xl bg-rose-600 py-3 font-semibold text-white transition-colors hover:bg-rose-700"
            >
              Luyện lại chủ đề này
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
