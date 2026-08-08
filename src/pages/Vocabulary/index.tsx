/**
 * Trang Từ Vựng - Vocabulary Flashcard với SRS
 * Hỗ trợ lật thẻ 3D, đánh giá chất lượng, chế độ danh sách/thẻ
 */
import { useState, useCallback, useEffect } from 'react'
import { BookOpen, List, LayoutGrid, ChevronLeft, ChevronRight, Star, TrendingUp, Clock, CheckCircle2, XCircle, Minus } from 'lucide-react'
import { useLessonStore, useProgressStore, useUserStore } from '@/store'
import type { SRSCard, VocabWord } from '@/types'
import { cn } from '@/lib/utils'
import { db, seedVocabularyData } from '@/services/db/schema'
import { calculateSM2, createNewSRSCard } from '@/services/srs/sm2'

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

function Flashcard({ word, isFlipped, onFlip }: FlashcardProps) {
  return (
    // Container perspective cho hiệu ứng 3D
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: '1200px', height: '280px' }}
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
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="mb-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/80">
            {word.partOfSpeech}
          </span>
          <h2 className="mb-2 text-4xl font-bold tracking-wide text-white">{word.word}</h2>
          <p className="text-lg text-indigo-200">{word.pronunciation}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {word.tags.map(tag => (
              <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                #{tag}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/50">Nhấn để xem nghĩa ↓</p>
        </div>

        {/* MẶT SAU - Tiếng Việt */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="mb-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/80">
            Nghĩa tiếng Việt
          </span>
          <h2 className="mb-4 text-3xl font-bold text-white">{word.meaning}</h2>
          <div className="w-full space-y-2">
            {word.examples.slice(0, 2).map((ex, i) => (
              <div key={i} className="rounded-lg bg-white/10 px-4 py-2">
                <p className="text-sm italic text-white/90">"{ex}"</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/50">Nhấn để lật lại ↑</p>
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
    <div className="flex items-center gap-4 rounded-xl bg-gray-800 p-4 transition-colors hover:bg-gray-700">
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        word.difficulty === 1 ? 'bg-emerald-900/50 text-emerald-400' :
        word.difficulty === 2 ? 'bg-yellow-900/50 text-yellow-400' :
        'bg-red-900/50 text-red-400'
      )}>
        {word.difficulty === 1 ? 'E' : word.difficulty === 2 ? 'M' : 'H'}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-white">{word.word}</span>
          <span className="text-sm text-gray-400">{word.pronunciation}</span>
        </div>
        <p className="text-sm text-gray-300">{word.meaning}</p>
        <p className="mt-0.5 text-xs italic text-gray-500">"{word.examples[0]}"</p>
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
  const { progress, incrementVocab, addXP } = useProgressStore()
  const { user } = useUserStore()
  const { setSRSCards } = useLessonStore()

  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [studyMode, setStudyMode] = useState<StudyMode>('all')
  const [cardState, setCardState] = useState<CardState>({
    index: 0,
    isFlipped: false,
    reviewed: new Set(),
    ratings: {},
  })
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
    <div className="min-h-screen bg-gray-950 pb-24 pt-4">
      <div className="mx-auto max-w-lg px-4">

        {/* ===== HEADER THỐNG KÊ ===== */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-xl bg-orange-900/30 p-3 ring-1 ring-orange-700/50">
            <Clock className="mb-1 h-5 w-5 text-orange-400" />
            <span className="text-xl font-bold text-white">{Math.max(0, totalCards - reviewedCount)}</span>
            <span className="text-xs text-gray-400">Đến hạn</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-indigo-900/30 p-3 ring-1 ring-indigo-700/50">
            <BookOpen className="mb-1 h-5 w-5 text-indigo-400" />
            <span className="text-xl font-bold text-white">{SAMPLE_WORDS.length}</span>
            <span className="text-xs text-gray-400">Từ mới</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-emerald-900/30 p-3 ring-1 ring-emerald-700/50">
            <CheckCircle2 className="mb-1 h-5 w-5 text-emerald-400" />
            <span className="text-xl font-bold text-white">{masteredCount}</span>
            <span className="text-xs text-gray-400">Đã thuộc</span>
          </div>
        </div>

        {/* ===== TABS CHẾ ĐỘ HỌC ===== */}
        <div className="mb-6 flex rounded-xl bg-gray-800 p-1">
          {(['all', 'new', 'review'] as StudyMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => {
                setStudyMode(mode)
                setCardState(prev => ({ ...prev, index: 0, isFlipped: false }))
              }}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                studyMode === mode ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
              )}
            >
              {mode === 'all' ? 'Tất cả' : mode === 'new' ? 'Học mới' : 'Ôn tập'}
            </button>
          ))}
        </div>

        {/* ===== TOGGLE VIEW + THỐNG KÊ ===== */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-gray-400">
              Retention: <span className="font-semibold text-white">{retentionRate}%</span>
            </span>
          </div>
          <div className="flex rounded-lg bg-gray-800 p-1">
            <button
              onClick={() => setViewMode('card')}
              className={cn('rounded-md p-1.5 transition-colors', viewMode === 'card' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('rounded-md p-1.5 transition-colors', viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ===== PROGRESS BAR ===== */}
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{reviewedCount}/{totalCards} thẻ</span>
            <span>{retentionRate}% nhớ</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: totalCards > 0 ? `${(reviewedCount / totalCards) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* ===== CHẾ ĐỘ THẺ (CARD MODE) ===== */}
        {viewMode === 'card' && (
          <>
            {filteredWords.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-gray-800 py-16 text-center">
                <Star className="h-12 w-12 text-yellow-400" />
                <p className="text-lg font-semibold text-white">Không có thẻ nào!</p>
                <p className="text-sm text-gray-400">Chuyển sang chế độ khác để học.</p>
              </div>
            ) : isCompleted ? (
              // Màn hình hoàn thành phiên học
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-teal-900/50 p-8 text-center ring-1 ring-emerald-700/50">
                <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                <h3 className="text-2xl font-bold text-white">Hoàn thành! 🎉</h3>
                <p className="text-gray-300">Bạn đã ôn xong <strong>{totalCards}</strong> từ</p>
                <div className="mt-2 grid w-full grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-900/40 p-3">
                    <div className="text-2xl font-bold text-emerald-400">{masteredCount}</div>
                    <div className="text-xs text-gray-400">Đã thuộc</div>
                  </div>
                  <div className="rounded-xl bg-red-900/40 p-3">
                    <div className="text-2xl font-bold text-red-400">{reviewedCount - masteredCount}</div>
                    <div className="text-xs text-gray-400">Cần ôn thêm</div>
                  </div>
                </div>
                <button
                  onClick={() => setCardState({ index: 0, isFlipped: false, reviewed: new Set(), ratings: {} })}
                  className="mt-2 w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Học lại từ đầu
                </button>
              </div>
            ) : currentWord ? (
              <>
                <div className="mb-3 text-center text-sm text-gray-500">
                  {cardState.index + 1} / {filteredWords.length}
                </div>

                {/* Flashcard 3D */}
                <Flashcard word={currentWord} isFlipped={cardState.isFlipped} onFlip={handleFlip} />

                {/* Nút rating / điều hướng */}
                <div className="mt-6">
                  {cardState.isFlipped ? (
                    <div>
                      <p className="mb-3 text-center text-sm text-gray-400">Bạn nhớ từ này như thế nào?</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleRate(1)}
                          className="flex flex-col items-center gap-1 rounded-xl bg-red-900/40 p-4 ring-1 ring-red-700/50 transition-all hover:bg-red-900/60 active:scale-95"
                        >
                          <XCircle className="h-6 w-6 text-red-400" />
                          <span className="text-sm font-semibold text-red-300">Khó</span>
                          <span className="text-xs text-red-400/60">+1 XP</span>
                        </button>
                        <button
                          onClick={() => handleRate(3)}
                          className="flex flex-col items-center gap-1 rounded-xl bg-yellow-900/40 p-4 ring-1 ring-yellow-700/50 transition-all hover:bg-yellow-900/60 active:scale-95"
                        >
                          <Minus className="h-6 w-6 text-yellow-400" />
                          <span className="text-sm font-semibold text-yellow-300">Ổn</span>
                          <span className="text-xs text-yellow-400/60">+2 XP</span>
                        </button>
                        <button
                          onClick={() => handleRate(5)}
                          className="flex flex-col items-center gap-1 rounded-xl bg-emerald-900/40 p-4 ring-1 ring-emerald-700/50 transition-all hover:bg-emerald-900/60 active:scale-95"
                        >
                          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                          <span className="text-sm font-semibold text-emerald-300">Dễ</span>
                          <span className="text-xs text-emerald-400/60">+5 XP</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePrev}
                        disabled={cardState.index === 0}
                        className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-gray-700 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </button>
                      <button
                        onClick={handleFlip}
                        className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        Xem nghĩa
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={cardState.index === filteredWords.length - 1}
                        className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-gray-700 disabled:opacity-40"
                      >
                        Tiếp
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Thống kê streak + XP */}
                <div className="mt-6 flex items-center justify-center gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{progress?.currentStreak ?? 0}</div>
                    <div className="text-xs text-gray-500">🔥 Streak</div>
                  </div>
                  <div className="h-8 w-px bg-gray-700" />
                  <div>
                    <div className="text-lg font-bold text-white">{progress?.totalXP ?? 0}</div>
                    <div className="text-xs text-gray-500">⭐ XP</div>
                  </div>
                  <div className="h-8 w-px bg-gray-700" />
                  <div>
                    <div className="text-lg font-bold text-white">{progress?.vocabularyCount ?? 0}</div>
                    <div className="text-xs text-gray-500">📚 Từ học</div>
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* ===== CHẾ ĐỘ DANH SÁCH (LIST MODE) ===== */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {SAMPLE_WORDS.map(word => (
              <WordListItem key={word.id} word={word} rating={cardState.ratings[word.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
