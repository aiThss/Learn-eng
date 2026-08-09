/**
 * SM-2 Spaced Repetition Algorithm
 * Thuật toán SRS nổi tiếng từ SuperMemo
 * 
 * Chất lượng trả lời (quality):
 * 5 - Hoàn hảo, nhớ ngay
 * 4 - Đúng nhưng phải nghĩ một chút
 * 3 - Đúng nhưng khó nhớ
 * 2 - Sai nhưng nhớ được câu trả lời
 * 1 - Sai, câu trả lời trông quen
 * 0 - Sai hoàn toàn, không biết
 */
import type { SRSCard } from '@/types'

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5

interface SM2Result {
  interval: number      // số ngày đến lần review tiếp theo
  repetitions: number   // số lần lặp thành công
  easeFactor: number    // ease factor (EF)
  dueDate: Date
  isMastered: boolean
}

/**
 * Tính toán SM-2 cho một review
 * @param quality - chất lượng trả lời 0-5
 * @param card - SRS card hiện tại
 */
export function calculateSM2(quality: ReviewQuality, card: SRSCard): SM2Result {
  let { repetitions, easeFactor, interval } = card

  if (quality >= 3) {
    // Trả lời đúng
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1

    // SM-2 adjusts ease only after a successful recall. A failed recall
    // restarts the interval sequence while preserving the item's E-Factor.
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easeFactor < 1.3) easeFactor = 1.3
  } else {
    // Trả lời sai - reset về đầu
    repetitions = 0
    interval = 1
  }
  
  // Tính ngày review tiếp theo
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + interval)
  
  // Coi là "mastered" nếu interval > 21 ngày (3 tuần)
  const isMastered = interval >= 21 && repetitions >= 5

  return { interval, repetitions, easeFactor, dueDate, isMastered }
}

/**
 * Tạo SRS card mới cho một từ vựng
 */
export function createNewSRSCard(wordId: string, userId: string): Omit<SRSCard, 'id'> {
  const dueDate = new Date() // Due ngay hôm nay (từ mới)
  
  return {
    wordId,
    userId,
    repetitions: 0,
    easeFactor: 2.5, // Giá trị mặc định SM-2
    interval: 0,
    dueDate,
    isNew: true,
    isMastered: false,
  }
}

/**
 * Đếm số card cần review hôm nay
 */
export function countDueCards(cards: SRSCard[]): number {
  const now = new Date()
  return cards.filter(c => new Date(c.dueDate) <= now && !c.isMastered).length
}

/**
 * Phân loại cards thành new / review / mastered
 */
export function classifyCards(cards: SRSCard[]) {
  const now = new Date()
  return {
    newCards: cards.filter(c => c.isNew),
    dueCards: cards.filter(c => !c.isNew && new Date(c.dueDate) <= now && !c.isMastered),
    upcomingCards: cards.filter(c => !c.isNew && new Date(c.dueDate) > now && !c.isMastered),
    masteredCards: cards.filter(c => c.isMastered),
  }
}

/**
 * Tính retention rate (tỷ lệ nhớ)
 */
export function calculateRetentionRate(cards: SRSCard[]): number {
  if (cards.length === 0) return 0
  const reviewed = cards.filter(c => c.repetitions > 0)
  const successful = reviewed.filter(c => c.quality !== undefined && (c.quality as number) >= 3)
  return reviewed.length > 0 ? (successful.length / reviewed.length) * 100 : 0
}

/**
 * Ước tính điểm IELTS dựa trên từ vựng đã mastered
 */
export function estimateIELTSFromVocab(masteredCount: number): number {
  // Công thức ước tính đơn giản
  // < 500 từ: 3.0-3.5
  // 500-1000: 4.0-4.5  
  // 1000-2000: 5.0-5.5
  // 2000-3500: 6.0-6.5
  if (masteredCount < 200) return 3.0
  if (masteredCount < 500) return 3.0 + (masteredCount - 200) / 300 * 0.5
  if (masteredCount < 1000) return 3.5 + (masteredCount - 500) / 500 * 1.0
  if (masteredCount < 2000) return 4.5 + (masteredCount - 1000) / 1000 * 1.0
  if (masteredCount < 3500) return 5.5 + (masteredCount - 2000) / 1500 * 1.0
  return 6.5
}
