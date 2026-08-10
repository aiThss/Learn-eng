/**
 * Trang Từ Vựng - Vocabulary Flashcard với SRS
 * Hỗ trợ lật thẻ 3D, đánh giá chất lượng, chế độ danh sách/thẻ
 */
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, List, LayoutGrid, ChevronLeft, ChevronRight, Star, TrendingUp, Clock, CheckCircle2, XCircle, Minus, Volume2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLessonStore, useProgressStore, useSettingsStore, useUserStore } from '@/store'
import type { SRSCard, VocabWord } from '@/types'
import { cn } from '@/lib/utils'
import { db, seedVocabularyData } from '@/services/db/schema'
import { calculateSM2, createNewSRSCard } from '@/services/srs/sm2'
import { playPronunciation } from '@/services/speech/pronunciation'

// ========================
// DỮ LIỆU MẪU PHASE 0
// ========================
const SAMPLE_WORDS: VocabWord[] = [
  { id: 'v001', word: 'Hello', pronunciation: '/həˈləʊ/', meaning: 'Xin chào', partOfSpeech: 'interjection', examples: ['Hello! How are you?'], phase: 'PHASE_0', week: 1, tags: ['greeting'], difficulty: 1 },
  { id: 'v002', word: 'Thank you', pronunciation: '/ˈθæŋk ju/', meaning: 'Cảm ơn', partOfSpeech: 'phrase', examples: ['Thank you very much!'], phase: 'PHASE_0', week: 1, tags: ['greeting'], difficulty: 1 },
  { id: 'v003', word: 'Sorry', pronunciation: '/ˈsɒri/', meaning: 'Xin lỗi', partOfSpeech: 'interjection', examples: ["I'm sorry for being late."], phase: 'PHASE_0', week: 1, tags: ['greeting'], difficulty: 1 },
  { id: 'v004', word: 'Please', pronunciation: '/pliːz/', meaning: 'Xin / Làm ơn', partOfSpeech: 'adverb', examples: ['Please sit down.'], phase: 'PHASE_0', week: 1, tags: ['polite'], difficulty: 1 },
  { id: 'v005', word: 'Yes / No', pronunciation: '/jes/ /nəʊ/', meaning: 'Có / Không', partOfSpeech: 'interjection', examples: ['Yes, I can.', 'No, I cannot.'], phase: 'PHASE_0', week: 1, tags: ['basic'], difficulty: 1 },
  { id: 'v006', word: 'Water', pronunciation: '/ˈwɔːtər/', meaning: 'Nước', partOfSpeech: 'noun', examples: ['Can I have some water?'], phase: 'PHASE_0', week: 1, tags: ['food'], difficulty: 1 },
  { id: 'v007', word: 'Food', pronunciation: '/fuːd/', meaning: 'Đồ ăn', partOfSpeech: 'noun', examples: ['The food is delicious.'], phase: 'PHASE_0', week: 1, tags: ['food'], difficulty: 1 },
  { id: 'v008', word: 'Good', pronunciation: '/ɡʊd/', meaning: 'Tốt', partOfSpeech: 'adjective', examples: ['This is a good idea.'], phase: 'PHASE_0', week: 1, tags: ['basic'], difficulty: 1 },
  { id: 'v009', word: 'Big', pronunciation: '/bɪɡ/', meaning: 'To / Lớn', partOfSpeech: 'adjective', examples: ['It is a big city.'], phase: 'PHASE_0', week: 1, tags: ['adjective'], difficulty: 1 },
  { id: 'v010', word: 'Small', pronunciation: '/smɔːl/', meaning: 'Nhỏ', partOfSpeech: 'adjective', examples: ['My room is small.'], phase: 'PHASE_0', week: 1, tags: ['adjective'], difficulty: 1 },
]

// ========================
// TYPES
// ========================
type ViewMode = 'card' | 'list'
type StudyMode = 'new' | 'review' | 'all'
type RatingQuality = 1 | 3 | 5

interface CardState {
  index: number
  isFlipped: boolean
  reviewed: Set<string>
  ratings: Record<string, RatingQuality>
}

// ========================
// FLASHCARD COMPONENT
// ========================
interface FlashcardProps {
  word: VocabWord
  isFlipped: boolean
  onFlip: () => void
}

const PART_OF_SPEECH_LABELS: Record<string, string> = {
  interjection: 'Thán từ',
  phrase: 'Cụm từ',
  adverb: 'Trạng từ',
  noun: 'Danh từ',
  adjective: 'Tính từ',
}

const TAG_LABELS: Record<string, string> = {
  greeting: 'chào_hỏi',
  polite: 'lịch_sự',
  basic: 'cơ_bản',
  food: 'đồ_ăn',
  adjective: 'tính_từ',
}

interface SummaryCardProps {
  icon: LucideIcon
  value: number
  label: string
  iconClassName: string
}

function SummaryCard({ icon: Icon, value, label, iconClassName }: SummaryCardProps) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center rounded-[1.25rem] border border-border bg-card px-2 py-2 text-center shadow-card">
      <div className={cn('mb-1 flex h-8 w-8 items-center justify-center rounded-xl', iconClassName)}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
      <span className="text-xl font-extrabold leading-none text-foreground tabular-nums">{value}</span>
      <span className="mt-1 text-xs font-medium leading-4 text-muted-foreground">{label}</span>
    </div>
  )
}

function Flashcard({ word, isFlipped, onFlip }: FlashcardProps) {
  return (
    // Container perspective cho hiệu ứng 3D
    <div
      className="relative h-[208px] w-full cursor-pointer sm:h-[248px]"
      style={{ perspective: '1200px' }}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onFlip()}
      aria-label={`Flashcard: ${word.word}. ${isFlipped ? 'Showing back' : 'Showing front'}`}
    >
      {/* Inner - thực hiện xoay 3D */}
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* MẶT TRƯỚC - Tiếng Anh */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.25rem] bg-brand-700 p-4 text-center shadow-elevated sm:p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="mb-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {PART_OF_SPEECH_LABELS[word.partOfSpeech] ?? word.partOfSpeech}
          </span>
          <h2 className="mb-1 text-3xl font-extrabold tracking-wide text-white sm:text-4xl">{word.word}</h2>
          <p className="rounded-lg bg-white/10 px-3 py-1 text-base tracking-wide text-white/90">{word.pronunciation}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {word.tags.map(tag => (
              <span key={tag} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
                #{TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-white/90">Nhấn để xem nghĩa ↓</p>
        </div>

        {/* MẶT SAU - Tiếng Việt */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.25rem] bg-success p-4 text-center shadow-elevated sm:p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="mb-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            Nghĩa tiếng Việt
          </span>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">{word.meaning}</h2>
          <div className="w-full space-y-2">
            {word.examples.slice(0, 2).map((ex, i) => (
              <div key={i} className="rounded-xl bg-white/15 px-4 py-2">
                <p className="text-sm italic text-white/90">"{ex}"</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-white/90">Nhấn để lật lại ↑</p>
        </div>
      </div>
    </div>
  )
}

// ========================
// WORD LIST ITEM
// ========================
interface WordListItemProps {
  word: VocabWord
  rating?: RatingQuality
}

function WordListItem({ word, rating }: WordListItemProps) {
  const ratingColor: Record<RatingQuality, string> = {
    1: 'text-red-400',
    3: 'text-yellow-400',
    5: 'text-emerald-400',
  }

  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-card p-4 shadow-card transition-colors hover:border-border-strong">
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        word.difficulty === 1 ? 'bg-[#ecfdf5] text-success' :
        word.difficulty === 2 ? 'bg-[#fffbeb] text-warning' :
        'bg-[#fef2f2] text-destructive'
      )}>
        {word.difficulty === 1 ? 'E' : word.difficulty === 2 ? 'M' : 'H'}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-foreground">{word.word}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{word.pronunciation}</span>
        </div>
        <p className="text-sm text-muted-foreground">{word.meaning}</p>
        <p className="mt-1 text-xs italic text-muted-foreground">"{word.examples[0]}"</p>
      </div>
      {rating && (
        <span className={cn('text-xs font-medium', ratingColor[rating])}>
          {rating === 1 ? 'Khó' : rating === 3 ? 'Ổn' : 'Dễ'}
        </span>
      )}
    </div>
  )
}

// ========================
// TRANG CHÍNH
// ========================
export default function VocabularyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { progress, incrementVocab, addXP } = useProgressStore()
  const { user } = useUserStore()
  const { settings } = useSettingsStore()
  const { setSRSCards } = useLessonStore()

  const viewMode: ViewMode = searchParams.get('view') === 'list' ? 'list' : 'card'
  const selectedStudyMode = searchParams.get('mode')
  const studyMode: StudyMode = selectedStudyMode === 'new' || selectedStudyMode === 'review' ? selectedStudyMode : 'all'
  const [cardState, setCardState] = useState<CardState>({
    index: 0,
    isFlipped: false,
    reviewed: new Set(),
    ratings: {},
  })

  const setViewMode = (view: ViewMode) => {
    const next = new URLSearchParams(searchParams)
    if (view === 'card') next.delete('view')
    else next.set('view', view)
    setSearchParams(next)
  }

  const setStudyMode = (mode: StudyMode) => {
    const next = new URLSearchParams(searchParams)
    if (mode === 'all') next.delete('mode')
    else next.set('mode', mode)
    setSearchParams(next)
  }
  const [storedCards, setStoredCards] = useState<SRSCard[]>([])

  // Một nguồn dữ liệu SRS duy nhất: IndexedDB. Trang có thể đóng/mở hoặc offline
  // mà lịch ôn vẫn giữ nguyên, không còn là state tạm của component.
  useEffect(() => {
    let cancelled = false
    const loadSRS = async () => {
      await seedVocabularyData(SAMPLE_WORDS)
      if (!user) return

      const cards = await db.srsCards.where('userId').equals(user.id).toArray() as SRSCard[]
      if (cancelled) return

      setStoredCards(cards)
      setSRSCards(cards)
      setCardState((previous) => ({
        ...previous,
        reviewed: new Set(cards.filter(card => card.lastReview).map(card => card.wordId)),
        ratings: Object.fromEntries(
          cards
            .filter(card => card.quality !== undefined)
            .map(card => [card.wordId, (card.quality! >= 5 ? 5 : card.quality! >= 3 ? 3 : 1) as RatingQuality]),
        ),
      }))
    }
    void loadSRS()
    return () => { cancelled = true }
  }, [setSRSCards, user])

  // Lọc danh sách từ theo chế độ học
  const filteredWords = SAMPLE_WORDS.filter(w => {
    if (studyMode === 'new') return !cardState.reviewed.has(w.id)
    if (studyMode === 'review') return cardState.reviewed.has(w.id)
    return true
  })

  const currentWord = filteredWords[cardState.index]
  const totalCards = filteredWords.length
  const reviewedCount = cardState.reviewed.size
  const masteredCount = Object.values(cardState.ratings).filter(r => r === 5).length

  // Tính tỉ lệ nhớ
  const retentionRate = reviewedCount > 0
    ? Math.round((masteredCount / reviewedCount) * 100)
    : 0

  const handleFlip = useCallback(() => {
    setCardState(prev => ({ ...prev, isFlipped: !prev.isFlipped }))
  }, [])

  // Đánh giá chất lượng và chuyển thẻ
  const handleRate = useCallback(async (quality: RatingQuality) => {
    if (!currentWord || !user) return

    const previousCard = storedCards.find(card => card.wordId === currentWord.id)
    const sourceCard = previousCard ?? createNewSRSCard(currentWord.id, user.id)
    const sm2 = calculateSM2(quality, sourceCard)
    const nextCard: SRSCard = {
      ...sourceCard,
      ...sm2,
      quality,
      lastReview: new Date(),
      isNew: false,
    }

    if (previousCard) {
      await db.srsCards.where({ wordId: currentWord.id, userId: user.id }).modify(nextCard)
    } else {
      await db.srsCards.add(nextCard)
    }

    const nextCards = previousCard
      ? storedCards.map(card => card.wordId === currentWord.id ? nextCard : card)
      : [...storedCards, nextCard]
    setStoredCards(nextCards)
    setSRSCards(nextCards)

    setCardState(prev => {
      const newReviewed = new Set(prev.reviewed)
      newReviewed.add(currentWord.id)
      const newRatings = { ...prev.ratings, [currentWord.id]: quality }
      const nextIndex = prev.index < filteredWords.length - 1 ? prev.index + 1 : prev.index

      return { index: nextIndex, isFlipped: false, reviewed: newReviewed, ratings: newRatings }
    })

    incrementVocab(!previousCard, !previousCard?.isMastered && nextCard.isMastered)
    if (quality === 5) addXP(5)
    else if (quality === 3) addXP(2)
    else addXP(1)
  }, [currentWord, filteredWords.length, storedCards, user, incrementVocab, addXP, setSRSCards])

  const handlePrev = () => setCardState(prev => ({ ...prev, index: Math.max(0, prev.index - 1), isFlipped: false }))
  const handleNext = () => setCardState(prev => ({ ...prev, index: Math.min(filteredWords.length - 1, prev.index + 1), isFlipped: false }))

  const isCompleted = reviewedCount >= totalCards && totalCards > 0

  return (
    <div className="min-h-full bg-background py-4 sm:py-6">
      <div className="mx-auto max-w-lg px-4">

      {/* ===== HEADER THỐNG KÊ ===== */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
          <SummaryCard
            icon={Clock}
            value={Math.max(0, totalCards - reviewedCount)}
            label="Đến hạn"
            iconClassName="bg-[#fff7ed] text-warning"
          />
          <SummaryCard
            icon={BookOpen}
            value={SAMPLE_WORDS.length}
            label="Từ mới"
            iconClassName="bg-[#eaf2ff] text-primary"
          />
          <SummaryCard
            icon={CheckCircle2}
            value={masteredCount}
            label="Đã thuộc"
            iconClassName="bg-[#ecfdf5] text-success"
          />
        </div>

      {/* ===== TABS CHẾ ĐỘ HỌC ===== */}
        <div className="mb-6 flex rounded-[1.25rem] border border-border bg-card p-1 shadow-card" role="tablist" aria-label="Chế độ học từ vựng">
          {(['all', 'new', 'review'] as StudyMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => {
                setStudyMode(mode)
                setCardState(prev => ({ ...prev, index: 0, isFlipped: false }))
              }}
              className={cn(
                'min-h-11 flex-1 rounded-[1rem] px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                studyMode === mode ? 'bg-primary text-white shadow-card' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              role="tab"
              aria-selected={studyMode === mode}
            >
              {mode === 'all' ? 'Tất cả' : mode === 'new' ? 'Học mới' : 'Ôn tập'}
            </button>
          ))}
        </div>

        {/* ===== TOGGLE VIEW + THỐNG KÊ ===== */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" strokeWidth={2} />
            <span className="text-sm text-muted-foreground">
              Tỷ lệ ghi nhớ: <span className="font-bold text-foreground">{retentionRate}%</span>
            </span>
          </div>
          <div className="flex rounded-xl border border-border bg-card p-1 shadow-card" aria-label="Chọn cách hiển thị">
            <button
              onClick={() => setViewMode('card')}
              className={cn('flex h-11 w-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', viewMode === 'card' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
              aria-label="Hiển thị dạng thẻ"
              aria-pressed={viewMode === 'card'}
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('flex h-11 w-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
              aria-label="Hiển thị dạng danh sách"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ===== PROGRESS BAR ===== */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{reviewedCount}/{totalCards} thẻ</span>
            <span className="font-medium text-foreground">{retentionRate}% nhớ</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: totalCards > 0 ? `${(reviewedCount / totalCards) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* ===== CHẾ ĐỘ THẺ (CARD MODE) ===== */}
        {viewMode === 'card' && (
          <>
            {filteredWords.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-[1.25rem] border border-border bg-card px-6 py-16 text-center shadow-card">
                <Star className="h-12 w-12 text-warning" />
                <p className="text-lg font-bold text-foreground">Không có thẻ nào!</p>
                <p className="text-sm text-muted-foreground">Chuyển sang chế độ khác để học.</p>
              </div>
            ) : isCompleted ? (
              // Màn hình hoàn thành phiên học
              <div className="flex flex-col items-center gap-4 rounded-[1.25rem] border border-[#a7f3d0] bg-[#ecfdf5] p-8 text-center shadow-card">
                <CheckCircle2 className="h-16 w-16 text-success" />
                <h3 className="text-2xl font-bold text-foreground">Hoàn thành! 🎉</h3>
                <p className="text-muted-foreground">Bạn đã ôn xong <strong className="text-foreground">{totalCards}</strong> từ</p>
                <div className="mt-2 grid w-full grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#a7f3d0] bg-card p-3">
                    <div className="text-2xl font-bold text-success">{masteredCount}</div>
                    <div className="text-xs text-muted-foreground">Đã thuộc</div>
                  </div>
                  <div className="rounded-xl border border-[#fecaca] bg-card p-3">
                    <div className="text-2xl font-bold text-destructive">{reviewedCount - masteredCount}</div>
                    <div className="text-xs text-muted-foreground">Cần ôn thêm</div>
                  </div>
                </div>
                <button
                  onClick={() => setCardState({ index: 0, isFlipped: false, reviewed: new Set(), ratings: {} })}
                  className="mt-2 min-h-12 w-full rounded-[1rem] bg-success px-6 py-3 font-semibold text-white transition-colors hover:bg-[#065f46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Học lại từ đầu
                </button>
              </div>
            ) : currentWord ? (
              <>
                <div className="mb-2 text-center text-sm font-medium text-muted-foreground">
                  {cardState.index + 1} / {filteredWords.length}
                </div>

                {/* Flashcard 3D */}
                <Flashcard word={currentWord} isFlipped={cardState.isFlipped} onFlip={handleFlip} />

                {/* Nút rating / điều hướng */}
                <div className="mt-6">
                  {cardState.isFlipped ? (
                    <div>
                      <p className="mb-3 text-center text-sm text-muted-foreground">Bạn nhớ từ này như thế nào?</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleRate(1)}
                          className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-[#fecaca] bg-[#fef2f2] p-3 transition-colors hover:bg-[#fee2e2] active:scale-[0.98]"
                        >
                          <XCircle className="h-6 w-6 text-destructive" />
                          <span className="text-sm font-semibold text-[#991b1b]">Khó</span>
                          <span className="text-xs text-[#b91c1c]">+1 XP</span>
                        </button>
                        <button
                          onClick={() => handleRate(3)}
                          className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-[#fde68a] bg-[#fffbeb] p-3 transition-colors hover:bg-[#fef3c7] active:scale-[0.98]"
                        >
                          <Minus className="h-6 w-6 text-warning" />
                          <span className="text-sm font-semibold text-[#854d0e]">Ổn</span>
                          <span className="text-xs text-[#a16207]">+2 XP</span>
                        </button>
                        <button
                          onClick={() => handleRate(5)}
                          className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-[#a7f3d0] bg-[#ecfdf5] p-3 transition-colors hover:bg-[#d1fae5] active:scale-[0.98]"
                        >
                          <CheckCircle2 className="h-6 w-6 text-success" />
                          <span className="text-sm font-semibold text-[#065f46]">Dễ</span>
                          <span className="text-xs text-[#047857]">+5 XP</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={cardState.index === 0}
                        className="flex min-h-12 items-center gap-1 rounded-[1rem] border border-border bg-card px-3 py-3 text-sm font-medium text-muted-foreground shadow-card transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => settings.soundEnabled && void playPronunciation(currentWord.word)}
                          disabled={!settings.soundEnabled}
                          className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Nghe phát âm ${currentWord.word}`}
                          title={settings.soundEnabled ? 'Nghe phát âm' : 'Âm thanh đang tắt trong Cài đặt'}
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleFlip}
                          className="min-h-12 rounded-[1rem] bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Xem nghĩa
                        </button>
                      </div>
                      <button
                        onClick={handleNext}
                        disabled={cardState.index === filteredWords.length - 1}
                        className="flex min-h-12 items-center gap-1 rounded-[1rem] border border-border bg-card px-3 py-3 text-sm font-medium text-muted-foreground shadow-card transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                      >
                        Tiếp
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Thống kê streak + XP */}
                <div className="mt-6 flex items-center justify-center gap-5 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">{progress?.currentStreak ?? 0}</div>
                    <div className="text-xs text-muted-foreground">🔥 Chuỗi ngày</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-lg font-bold text-foreground">{progress?.totalXP ?? 0}</div>
                    <div className="text-xs text-muted-foreground">⭐ XP</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-lg font-bold text-foreground">{progress?.vocabularyCount ?? 0}</div>
                    <div className="text-xs text-muted-foreground">📚 Từ đã học</div>
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* ===== CHẾ ĐỘ DANH SÁCH (LIST MODE) ===== */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredWords.map(word => (
              <WordListItem key={word.id} word={word} rating={cardState.ratings[word.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
