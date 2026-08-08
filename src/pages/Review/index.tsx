/**
 * Smart Review - chỉ hiển thị các thẻ đến hạn từ IndexedDB.
 * Đây là cùng nguồn dữ liệu với Vocabulary để không thể mất lịch SRS khi đổi trang.
 */
import { useEffect, useState } from 'react'
import { CheckCircle, RotateCw, Sparkles, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { speak } from '@/services/speech/tts'
import { useLessonStore, useProgressStore, useUserStore } from '@/store'
import { db, getDueCards, updateSRSCard } from '@/services/db/schema'
import { calculateSM2, type ReviewQuality } from '@/services/srs/sm2'
import type { SRSCard, VocabWord } from '@/types'

interface ReviewItem {
  card: SRSCard
  word: VocabWord
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { addXP, incrementVocab } = useProgressStore()
  const { setSRSCards } = useLessonStore()
  const [items, setItems] = useState<ReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!user) return
      const dueCards = await getDueCards(user.id)
      const result = (await Promise.all(dueCards.map(async (card) => {
        const word = await db.vocabWords.get(card.wordId)
        return word ? { card, word } : null
      }))).filter((item): item is ReviewItem => item !== null)

      const allCards = await db.srsCards.where('userId').equals(user.id).toArray() as SRSCard[]
      if (!cancelled) {
        setItems(result)
        setSRSCards(allCards)
        setIsLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [setSRSCards, user])

  const current = items[0]

  const handleRate = async (quality: ReviewQuality) => {
    if (!current || !user) return
    const sm2 = calculateSM2(quality, current.card)
    const nextCard: SRSCard = {
      ...current.card,
      ...sm2,
      quality,
      isNew: false,
      lastReview: new Date(),
    }
    await updateSRSCard(nextCard)

    const remaining = items.slice(1)
    const allCards = await db.srsCards.where('userId').equals(user.id).toArray() as SRSCard[]
    setItems(remaining)
    setSRSCards(allCards)
    setCompleted((value) => value + 1)
    setIsFlipped(false)
    incrementVocab(false, !current.card.isMastered && nextCard.isMastered)
    addXP(quality >= 5 ? 5 : quality >= 3 ? 2 : 1)
  }

  if (isLoading) {
    return <div className="min-h-full p-6 text-center text-sm text-muted-foreground">Đang chuẩn bị thẻ ôn tập…</div>
  }

  if (!current) {
    return (
      <div className="min-h-full p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-success/15 text-success rounded-full flex items-center justify-center">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold">{completed ? 'Hoàn thành phiên ôn tập!' : 'Bạn chưa có thẻ đến hạn'}</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {completed
            ? `Bạn đã ôn ${completed} thẻ. EnglishUp đã lên lịch lần gặp tiếp theo bằng thuật toán SM-2.`
            : 'Học vài từ mới trong mục Từ vựng; các thẻ đến hạn sẽ tự xuất hiện ở đây.'}
        </p>
        <button
          onClick={() => navigate('/vocabulary')}
          className="w-full max-w-xs py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
        >
          Mở từ vựng
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full p-4 pb-8 flex flex-col space-y-4 max-w-md mx-auto">
      <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Ôn tập SRS · còn {items.length} thẻ
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsFlipped((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsFlipped((value) => !value)
          }
        }}
        className="flex-1 min-h-[340px] bg-card border border-border rounded-3xl p-6 flex flex-col justify-between items-center text-center cursor-pointer shadow-card relative"
        aria-label={isFlipped ? 'Lật về mặt trước thẻ' : 'Lật để xem nghĩa'}
      >
        <span className="w-full flex justify-end">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              speak(current.word.word)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                speak(current.word.word)
              }
            }}
            className="p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/80"
            aria-label={`Nghe từ ${current.word.word}`}
          >
            <Volume2 size={18} />
          </button>
        </span>

        <span className="my-auto space-y-3">
          <span className="block text-3xl font-black text-brand-600 dark:text-brand-400">{current.word.word}</span>
          <span className="block text-sm text-muted-foreground font-mono">{current.word.pronunciation}</span>

          {isFlipped ? (
            <span className="block pt-4 border-t border-border space-y-2 animate-fade-in">
              <span className="block text-xl font-bold text-foreground">{current.word.meaning}</span>
              <span className="block text-xs text-muted-foreground italic">“{current.word.examples[0]}”</span>
            </span>
          ) : (
            <span className="block text-xs text-muted-foreground pt-4">
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />Chạm để xem nghĩa
            </span>
          )}
        </span>

        <span className="text-[11px] text-muted-foreground">
          {isFlipped ? 'Chọn mức độ bạn nhớ từ này' : 'Lịch ôn được cá nhân hóa bằng SM-2'}
        </span>
      </div>

      {isFlipped ? (
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => void handleRate(1)} className="py-3 rounded-xl bg-destructive/15 text-destructive font-semibold text-sm border border-destructive/20">Khó</button>
          <button type="button" onClick={() => void handleRate(3)} className="py-3 rounded-xl bg-warning/15 text-warning-foreground font-semibold text-sm border border-warning/20">Ổn</button>
          <button type="button" onClick={() => void handleRate(5)} className="py-3 rounded-xl bg-success/15 text-success font-semibold text-sm border border-success/20">Dễ</button>
        </div>
      ) : (
        <button type="button" onClick={() => setIsFlipped(true)} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
          <RotateCw size={18} /> Lật mặt sau
        </button>
      )}
    </div>
  )
}
