/**
 * TodayLesson - Trang bài học hôm nay
 * Bao gồm 4 tab: Từ vựng, Ngữ pháp, Nghe, Luyện tập
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { useProgressStore, useLessonStore, useUserStore } from '@/store'
import { completeLessonOnce, db, getCompletedLessonKey } from '@/services/db/schema'
import { DAILY_STUDY_LISTENING, LISTENING_EXERCISES } from '@/data/listening'
import { speakSsml, stopSpeaking } from '@/services/speech/tts'
import { playPronunciation } from '@/services/speech/pronunciation'
import type { LearningPhase, ListeningExercise } from '@/types'

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
    id: 'e0',
    question: 'What does "opportunity" mean?',
    options: ['Thử thách', 'Cơ hội', 'Kinh nghiệm', 'Môi trường'],
    correct: 1,
    explanation: 'Opportunity nghĩa là cơ hội; đây là từ vựng trọng tâm của bài.',
  },
  {
    id: 'e-listening',
    question: 'Choose the sentence that matches Mia\'s study routine.',
    options: ['She studies English for two hours every day.', 'She studies English only on Sunday.', 'She watches films before bed.', 'She never reviews new words.'],
    correct: 0,
    explanation: 'Mia nói cô ấy học tiếng Anh hai giờ mỗi ngày và ôn lại từ vào Chủ nhật.',
  },
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

type TodayLessonPlan = {
  title: string
  levelLabel: string
  vocabulary: typeof MOCK_VOCAB
  grammar: typeof MOCK_GRAMMAR
  exercises: typeof MOCK_EXERCISES
  listening: ListeningExercise
}

const PHASE_TODAY_LESSONS: Record<LearningPhase, TodayLessonPlan> = {
  PHASE_0: {
    title: 'Lesson 1.1 · Chào hỏi & giới thiệu',
    levelLabel: 'A0 · Làm quen',
    vocabulary: [
      { word: 'hello', pronunciation: '/həˈləʊ/', meaning: 'xin chào', example: 'Hello! Nice to meet you.' },
      { word: 'name', pronunciation: '/neɪm/', meaning: 'tên', example: 'My name is Lan.' },
      { word: 'from', pronunciation: '/frɒm/', meaning: 'đến từ', example: 'I am from Vietnam.' },
      { word: 'thank you', pronunciation: '/ˈθæŋk juː/', meaning: 'cảm ơn', example: 'Thank you very much.' },
      { word: 'please', pronunciation: '/pliːz/', meaning: 'làm ơn', example: 'Please say that again.' },
    ],
    grammar: {
      title: 'Verb to be', titleVi: 'Động từ to be', structure: 'S + am / is / are',
      explanation: 'Use am, is and are to introduce people and simple facts.',
      explanationVi: 'Dùng am, is, are để nói về bản thân, người khác và thông tin cơ bản. Người Việt thường quên động từ to be trong câu.',
      uses: [
        { label: 'Giới thiệu bản thân', example: 'I am Minh.', vi: 'Tôi là Minh.' },
        { label: 'Hỏi thông tin', example: 'Where are you from?', vi: 'Bạn đến từ đâu?' },
        { label: 'Nói về người khác', example: 'She is my friend.', vi: 'Cô ấy là bạn tôi.' },
      ],
      keywords: ['am, is, are'],
    },
    exercises: [
      { id: 'a0-1', question: 'I _____ from Vietnam.', options: ['am', 'is', 'are', 'be'], correct: 0, explanation: 'Dùng am với chủ ngữ I.' },
      { id: 'a0-2', question: 'She _____ my friend.', options: ['am', 'is', 'are', 'be'], correct: 1, explanation: 'Dùng is với she.' },
      { id: 'a0-3', question: 'Choose the polite phrase:', options: ['Please', 'Yesterday', 'Blue', 'Seven'], correct: 0, explanation: 'Please là từ lịch sự khi nhờ ai đó.' },
      { id: 'a0-4', question: '“My name is Nam.” means:', options: ['Tôi khỏe', 'Tên tôi là Nam', 'Tôi ở nhà', 'Tôi thích Nam'], correct: 1, explanation: 'My name is… dùng để giới thiệu tên.' },
      { id: 'a0-5', question: 'They _____ students.', options: ['am', 'is', 'are', 'be'], correct: 2, explanation: 'Dùng are với they.' },
    ],
    listening: LISTENING_EXERCISES[0],
  },
  PHASE_1: {
    title: 'Lesson 1.1 · Thói quen học tập',
    levelLabel: 'A1 · Cơ bản',
    vocabulary: [
      { word: 'routine', pronunciation: '/ruːˈtiːn/', meaning: 'thói quen', example: 'My routine is simple.' },
      { word: 'review', pronunciation: '/rɪˈvjuː/', meaning: 'ôn lại', example: 'I review new words.' },
      { word: 'repeat', pronunciation: '/rɪˈpiːt/', meaning: 'lặp lại', example: 'Repeat the sentence, please.' },
      { word: 'before', pronunciation: '/bɪˈfɔː(r)/', meaning: 'trước', example: 'I read before bed.' },
      { word: 'confident', pronunciation: '/ˈkɒnfɪdənt/', meaning: 'tự tin', example: 'I feel confident today.' },
    ],
    grammar: {
      title: 'Present Simple', titleVi: 'Thì hiện tại đơn', structure: 'S + V / V-s(es)',
      explanation: 'Use the present simple for routines and facts.',
      explanationVi: 'Dùng hiện tại đơn cho thói quen. Với he/she/it, động từ thường thêm -s/-es; đây là lỗi người Việt rất hay bỏ sót.',
      uses: [
        { label: 'Thói quen', example: 'I study every day.', vi: 'Tôi học mỗi ngày.' },
        { label: 'Ngôi thứ ba', example: 'Mia reviews new words.', vi: 'Mia ôn từ mới.' },
        { label: 'Câu hỏi', example: 'Do you practise English?', vi: 'Bạn có luyện tiếng Anh không?' },
      ],
      keywords: ['every day, usually, often, always'],
    },
    exercises: [
      { id: 'a1-1', question: 'Mia _____ English every day.', options: ['study', 'studies', 'studied', 'studying'], correct: 1, explanation: 'Mia là ngôi thứ ba số ít nên dùng studies.' },
      { id: 'a1-2', question: 'I _____ ten words in the morning.', options: ['review', 'reviews', 'reviewed', 'reviewing'], correct: 0, explanation: 'Dùng review với chủ ngữ I.' },
      { id: 'a1-3', question: 'Choose the correct question:', options: ['Do you practise?', 'You practise do?', 'Practise you?', 'Are practise you?'], correct: 0, explanation: 'Hiện tại đơn dùng Do/Does để hỏi.' },
      { id: 'a1-4', question: '“Repeat” means:', options: ['Lắng nghe', 'Lặp lại', 'Viết', 'Dịch'], correct: 1, explanation: 'Repeat nghĩa là lặp lại.' },
      { id: 'a1-5', question: 'She _____ confident.', options: ['feel', 'feels', 'felt', 'feeling'], correct: 1, explanation: 'She đi với feels trong hiện tại đơn.' },
    ],
    listening: DAILY_STUDY_LISTENING,
  },
  PHASE_2: {
    title: 'Lesson 1.1 · Trải nghiệm nhà hàng',
    levelLabel: 'A2 · Trung cấp',
    vocabulary: [
      { word: 'menu', pronunciation: '/ˈmenjuː/', meaning: 'thực đơn', example: 'Here is the menu.' },
      { word: 'order', pronunciation: '/ˈɔːdə(r)/', meaning: 'gọi món', example: 'I would like to order soup.' },
      { word: 'certainly', pronunciation: '/ˈsɜːtnli/', meaning: 'chắc chắn rồi', example: 'Certainly. Please sit down.' },
      { word: 'anything else', pronunciation: '/ˌeniθɪŋ ˈels/', meaning: 'còn gì khác không', example: 'Would you like anything else?' },
      { word: 'price', pronunciation: '/praɪs/', meaning: 'giá tiền', example: 'What is the price?' },
    ],
    grammar: {
      title: 'Polite requests', titleVi: 'Yêu cầu lịch sự', structure: 'Can I have …? / I would like …',
      explanation: 'Use these forms to order food and make polite requests.',
      explanationVi: 'Can I have…? và I would like… lịch sự hơn nói thẳng “Give me”. Hãy dùng please để giọng nói mềm mại hơn.',
      uses: [
        { label: 'Gọi món', example: 'Can I have the soup, please?', vi: 'Cho tôi món súp, làm ơn.' },
        { label: 'Đồ uống', example: 'I would like a glass of water.', vi: 'Tôi muốn một cốc nước.' },
        { label: 'Hỏi giá', example: 'How much is it?', vi: 'Nó bao nhiêu tiền?' },
      ],
      keywords: ['can I, would like, please'],
    },
    exercises: [
      { id: 'a2-1', question: '_____ I have a table for two, please?', options: ['Can', 'Do', 'Am', 'Did'], correct: 0, explanation: 'Can I have…? là mẫu yêu cầu lịch sự.' },
      { id: 'a2-2', question: 'I would like _____ water.', options: ['a glass of', 'many', 'an', 'some a'], correct: 0, explanation: 'A glass of water là một cụm danh từ đúng.' },
      { id: 'a2-3', question: '“Anything else?” asks about:', options: ['Thời gian', 'Món gọi thêm', 'Địa chỉ', 'Công việc'], correct: 1, explanation: 'Nhân viên hỏi bạn có muốn gọi thêm không.' },
      { id: 'a2-4', question: 'Which sentence is most polite?', options: ['Give me soup.', 'Soup now.', 'Can I have soup, please?', 'I soup.'], correct: 2, explanation: 'Can I have… please? lịch sự và tự nhiên.' },
      { id: 'a2-5', question: 'How _____ is it?', options: ['much', 'many', 'long', 'old'], correct: 0, explanation: 'How much dùng để hỏi giá tiền.' },
    ],
    listening: LISTENING_EXERCISES[1],
  },
  PHASE_3: {
    title: 'Lesson 1.1 · Kinh nghiệm & phát triển',
    levelLabel: 'B1 · Khá',
    vocabulary: MOCK_VOCAB,
    grammar: MOCK_GRAMMAR,
    exercises: MOCK_EXERCISES,
    listening: DAILY_STUDY_LISTENING,
  },
}

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
function VocabTab({ isUnlocked, lesson }: { isUnlocked: boolean; lesson: TodayLessonPlan }) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)

  if (!isUnlocked) return <LockedTab />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-white">{lesson.vocabulary.length} từ mới hôm nay</h3>
        <button className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-xl active:scale-95 transition-transform">
          <Play className="w-4 h-4" />
          Học tất cả
        </button>
      </div>

      {lesson.vocabulary.map((item, i) => (
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
              onClick={() => {
                if (playingIdx === i) {
                  stopSpeaking()
                  setPlayingIdx(null)
                  return
                }
                setPlayingIdx(i)
                void playPronunciation(item.word).finally(() => setPlayingIdx(null))
              }}
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
function GrammarTab({ isUnlocked, lesson }: { isUnlocked: boolean; lesson: TodayLessonPlan }) {
  if (!isUnlocked) return <LockedTab />
  const grammar = lesson.grammar

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/30 border border-purple-500/30 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
          Ngữ pháp hôm nay
        </span>
        <h3 className="text-xl font-black text-white mt-1">{grammar.titleVi}</h3>
        <code className="inline-block mt-2 px-3 py-1.5 bg-gray-900/60 rounded-lg text-sm font-mono text-indigo-300 border border-indigo-500/20">
          {grammar.structure}
        </code>
      </div>

      {/* Giải thích */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-2">📖 Giải thích</h4>
        <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 border border-gray-700/30 rounded-xl p-4">
          {grammar.explanationVi}
        </p>
      </div>

      {/* Cách dùng */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-3">🎯 Cách dùng</h4>
        <div className="space-y-3">
          {grammar.uses.map((use, i) => (
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
          {grammar.keywords.flatMap((keyword) => keyword.split(', ')).map((kw, i) => (
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
function ListeningTab({ isUnlocked, listening }: { isUnlocked: boolean; listening: ListeningExercise }) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(listening.duration)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showTranscript, setShowTranscript] = useState(false)
  const [isDeviceSpeaking, setIsDeviceSpeaking] = useState(false)

  if (!isUnlocked) return <LockedTab />

  const questions = listening.questions.map((question) => ({
    q: question.question,
    options: question.options,
    correct: question.correctAnswer,
  }))
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`

  return (
    <div className="space-y-5">
      {/* Audio player */}
      <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/20 border border-teal-500/30 rounded-2xl p-5">
        <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
          Audio · {formatTime(audioDuration)}
        </p>
        <h3 className="text-base font-black text-white mb-4">
          {listening.title}
        </h3>

        <audio
          ref={audioRef}
          src={listening.audioUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            const duration = audioRef.current?.duration
            if (duration && Number.isFinite(duration)) setAudioDuration(duration)
          }}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onEnded={() => {
            setPlaying(false)
            setCurrentTime(0)
          }}
          onError={() => setPlaying(false)}
        />

        <div className="h-1.5 bg-gray-700/60 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((currentTime / audioDuration) * 100, 100)}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={async () => {
              if (!audioRef.current) return
              if (playing) {
                audioRef.current.pause()
                setPlaying(false)
                return
              }
              try {
                await audioRef.current.play()
                setPlaying(true)
              } catch {
                setPlaying(false)
              }
            }}
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
            {`${formatTime(currentTime)} / ${formatTime(audioDuration)}`}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isDeviceSpeaking) {
              stopSpeaking()
              setIsDeviceSpeaking(false)
              return
            }
            setIsDeviceSpeaking(speakSsml(listening.ssml ?? listening.transcript, () => setIsDeviceSpeaking(false)))
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500/15 px-3 py-2.5 text-xs font-bold text-teal-200 ring-1 ring-teal-400/30"
        >
          <Volume2 className="h-4 w-4" />
          {isDeviceSpeaking ? 'Dừng giọng thiết bị' : 'Đọc chậm bằng Web Speech'}
        </button>
      </div>

      <div className="rounded-xl border border-gray-700/40 bg-gray-800/50">
        <button
          type="button"
          onClick={() => setShowTranscript((visible) => !visible)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-white"
        >
          Subtitle & shadowing
          <ChevronRight className={cn('h-4 w-4 transition-transform', showTranscript && 'rotate-90')} />
        </button>
        {showTranscript && (
          <div className="border-t border-gray-700/40 px-4 pb-4 pt-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{listening.transcript}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {listening.shadowingCues?.map((cue) => (
                <span key={cue} className="rounded-full bg-teal-500/10 px-2.5 py-1 text-xs text-teal-200">↗ {cue}</span>
              ))}
            </div>
          </div>
        )}
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

/** Exit quiz: requires retrieval across vocabulary, grammar and listening. */
function PracticeTab({
  isUnlocked,
  exercises,
  onQuizStatusChange,
}: {
  isUnlocked: boolean
  exercises: TodayLessonPlan['exercises']
  onQuizStatusChange: (passed: boolean) => void
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!isUnlocked) return <LockedTab />

  const handleSubmit = () => {
    if (Object.keys(answers).length === exercises.length) {
      const correct = exercises.filter((ex) => answers[ex.id] === ex.correct).length
      onQuizStatusChange(correct / exercises.length >= 0.7)
      setSubmitted(true)
    }
  }

  const correctCount = submitted
    ? exercises.filter((ex) => answers[ex.id] === ex.correct).length
    : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white">Quiz cuối bài</h3>
        {submitted && (
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-400">
            <Star className="w-4 h-4" />
            {correctCount}/{exercises.length} đúng
          </div>
        )}
      </div>

      {exercises.map((ex, idx) => (
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
          disabled={Object.keys(answers).length < exercises.length}
          className={cn(
            'w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]',
            Object.keys(answers).length === exercises.length
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          )}
        >
          {Object.keys(answers).length < exercises.length
            ? `Trả lời ${exercises.length - Object.keys(answers).length} câu nữa`
            : 'Kiểm tra kết quả'}
        </button>
      )}

      {submitted && (
        <div className={cn(
          'rounded-xl border p-4 text-sm',
          correctCount / exercises.length >= 0.7
            ? 'border-green-500/30 bg-green-500/10 text-green-200'
            : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
        )}>
          <p className="font-bold">
            {correctCount / exercises.length >= 0.7
              ? 'Đạt quiz: bạn có thể hoàn thành bài học.'
              : 'Chưa đạt 70%: xem lại giải thích rồi làm lại quiz nhé.'}
          </p>
          {correctCount / exercises.length < 0.7 && (
            <button
              type="button"
              onClick={() => {
                setAnswers({})
                setSubmitted(false)
                onQuizStatusChange(false)
              }}
              className="mt-3 rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-amber-950"
            >
              Làm lại quiz
            </button>
          )}
        </div>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { addXP } = useProgressStore()
  const { user } = useUserStore()
  const { currentWeek, currentPhase } = useLessonStore()
  const lesson = PHASE_TODAY_LESSONS[currentPhase]
  const lessonId = `${currentPhase}-week-${currentWeek}-today`

  const [completedSections, setCompletedSections] = useState<Set<TabKey>>(new Set())
  const [lessonDone, setLessonDone] = useState(false)
  const [quizPassed, setQuizPassed] = useState(false)
  const [completionChecked, setCompletionChecked] = useState(false)
  const [savingCompletion, setSavingCompletion] = useState(false)
  const [earnedLessonXP, setEarnedLessonXP] = useState(false)

  const selectedTab = searchParams.get('tab')
  const activeTab: TabKey = TABS.some((tab) => tab.key === selectedTab)
    ? selectedTab as TabKey
    : 'vocabulary'

  const setActiveTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams)
    if (tab === 'vocabulary') next.delete('tab')
    else next.set('tab', tab)
    setSearchParams(next)
  }

  useEffect(() => {
    let cancelled = false

    if (!user) {
      setCompletionChecked(true)
      return () => { cancelled = true }
    }

    setCompletionChecked(false)
    void db.completedLessons
      .get(getCompletedLessonKey(user.id, lessonId))
      .then((record) => {
        if (!cancelled && record) setLessonDone(true)
      })
      .finally(() => {
        if (!cancelled) setCompletionChecked(true)
      })

    return () => { cancelled = true }
  }, [lessonId, user])

  // Tab được mở khóa theo thứ tự
  const getTabUnlocked = (tabKey: TabKey): boolean => {
    const order: TabKey[] = ['vocabulary', 'grammar', 'listening', 'practice']
    const tabIdx = order.indexOf(tabKey)
    if (tabIdx === 0) return true
    return completedSections.has(order[tabIdx - 1])
  }

  const handleCompleteSection = (section: TabKey) => {
    if (section === 'practice' && !quizPassed) return
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
  const canCompleteActiveTab = activeTab !== 'practice' || quizPassed

  const handleCompleteLesson = async () => {
    if (!user || savingCompletion) return

    setSavingCompletion(true)
    try {
      const completedNow = await completeLessonOnce(user.id, lessonId)
      if (completedNow) {
        addXP(100)
        setEarnedLessonXP(true)
      }
      setLessonDone(true)
    } finally {
      setSavingCompletion(false)
    }
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
          {earnedLessonXP ? '+100 XP' : 'Đã ghi nhận'}
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
            <p className="mt-0.5 text-xs text-indigo-300">{lesson.levelLabel} · {lesson.title}</p>
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
          <VocabTab isUnlocked={getTabUnlocked('vocabulary')} lesson={lesson} />
        )}
        {activeTab === 'grammar' && (
          <GrammarTab isUnlocked={getTabUnlocked('grammar')} lesson={lesson} />
        )}
        {activeTab === 'listening' && (
          <ListeningTab key={currentPhase} isUnlocked={getTabUnlocked('listening')} listening={lesson.listening} />
        )}
        {activeTab === 'practice' && (
          <PracticeTab isUnlocked={getTabUnlocked('practice')} exercises={lesson.exercises} onQuizStatusChange={setQuizPassed} />
        )}

        {/* Nút hoàn thành section */}
        {!completedSections.has(activeTab) && getTabUnlocked(activeTab) && (
          <button
            onClick={() => handleCompleteSection(activeTab)}
            disabled={!canCompleteActiveTab}
            className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeTab === 'practice' && !quizPassed ? 'Đạt 70% quiz để hoàn thành' : 'Hoàn thành phần này'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Complete lesson button khi xong tất cả */}
        {allDone && (
          <button
            onClick={handleCompleteLesson}
            disabled={!user || !completionChecked || savingCompletion}
            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl shadow-amber-500/30"
          >
            <Award className="w-5 h-5" />
            {savingCompletion ? 'Đang lưu kết quả...' : 'Hoàn thành bài học · +100 XP'}
          </button>
        )}
      </div>
    </div>
  )
}
