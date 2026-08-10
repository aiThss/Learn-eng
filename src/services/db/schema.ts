/**
 * Dexie.js Database Schema cho EnglishUp
 * Lưu dữ liệu offline với IndexedDB
 */
import Dexie, { type Table } from 'dexie'
import type {
  VocabWord,
  SRSCard,
  GrammarLesson,
  ListeningExercise,
  UserProgress,
  DailyActivity,
  ChatMessage,
  TestScore,
  UserSettings,
  WeekPlan,
} from '@/types'

// Schema version 1
export class EnglishUpDB extends Dexie {
  // Tables
  vocabWords!: Table<VocabWord>
  srsCards!: Table<SRSCard & { id?: number }>
  grammarLessons!: Table<GrammarLesson>
  listeningExercises!: Table<ListeningExercise>
  userProgress!: Table<UserProgress & { id?: number }>
  dailyActivities!: Table<DailyActivity & { id?: number }>
  chatHistory!: Table<ChatMessage & { sessionId: string }>
  testScores!: Table<TestScore>
  userSettings!: Table<UserSettings & { id?: number }>
  weekPlans!: Table<WeekPlan & { id?: number }>
  completedLessons!: Table<CompletedLesson>

  constructor() {
    super('EnglishUpDB')
    
    this.version(1).stores({
      // Vocabulary
      vocabWords: 'id, phase, week, partOfSpeech, difficulty, *tags',
      
      // SRS cards - index theo dueDate để query bài cần ôn hôm nay
      srsCards: '++id, wordId, userId, dueDate, isNew, isMastered',
      
      // Grammar lessons
      grammarLessons: 'id, phase, week, *tags',
      
      // Listening
      listeningExercises: 'id, difficulty, topic',
      
      // User data
      userProgress: '++id, userId',
      dailyActivities: '++id, userId, date',
      chatHistory: 'id, sessionId, role, timestamp',
      testScores: 'id, userId, testType, date',
      userSettings: '++id',
      weekPlans: '++id, week, phase',
      completedLessons: 'id, lessonId, userId, completedAt',
    })
  }
}

// Singleton instance
export const db = new EnglishUpDB()

export interface CompletedLesson {
  /** A stable per-user key prevents the same lesson being rewarded twice. */
  id: string
  lessonId: string
  userId: string
  completedAt: Date
  score?: number
}

// ========================
// DATABASE HELPER FUNCTIONS
// ========================

/**
 * Lấy các SRS cards cần review hôm nay
 */
export async function getDueCards(userId: string, limit = 20): Promise<SRSCard[]> {
  const now = new Date()
  return db.srsCards
    .where('dueDate')
    .belowOrEqual(now)
    .and(card => card.userId === userId && !card.isMastered)
    .limit(limit)
    .toArray() as Promise<SRSCard[]>
}

/**
 * Lấy các từ mới chưa học (chưa có SRS card)
 */
export async function getNewWords(userId: string, phase: string, limit = 10): Promise<VocabWord[]> {
  const learnedWordIds = new Set(
    (await db.srsCards.where('userId').equals(userId).toArray()).map(card => card.wordId)
  )
    
  return db.vocabWords
    .where('phase').equals(phase)
    .and(word => !learnedWordIds.has(word.id))
    .limit(limit)
    .toArray()
}

/**
 * Lưu kết quả SRS review (cập nhật SM-2 params)
 */
export async function updateSRSCard(card: SRSCard): Promise<void> {
  const existing = await db.srsCards
    .where({ wordId: card.wordId, userId: card.userId })
    .first()

  if (existing?.id === undefined) return

  // Update by the IndexedDB primary key. Passing the whole card to `modify`
  // can accidentally include a primary key when callers later add one.
  await db.srsCards.update(existing.id, card)
}

export function getCompletedLessonKey(userId: string, lessonId: string): string {
  return `${userId}:${lessonId}`
}

/**
 * Marks a lesson complete atomically. Returns true only for the first
 * completion, so XP can safely be awarded exactly once after a reload.
 */
export async function completeLessonOnce(
  userId: string,
  lessonId: string,
  score?: number,
): Promise<boolean> {
  const id = getCompletedLessonKey(userId, lessonId)

  return db.transaction('rw', db.completedLessons, async () => {
    if (await db.completedLessons.get(id)) return false

    await db.completedLessons.add({
      id,
      userId,
      lessonId,
      completedAt: new Date(),
      score,
    })
    return true
  })
}

/**
 * Lấy hoạt động ngày hôm nay
 */
export async function getTodayActivity(userId: string): Promise<DailyActivity | undefined> {
  const today = new Date().toISOString().split('T')[0]
  return db.dailyActivities
    .where({ userId, date: today })
    .first() as Promise<DailyActivity | undefined>
}

/**
 * Cập nhật tiến độ ngày
 */
export async function updateDailyActivity(
  userId: string,
  updates: Partial<DailyActivity>
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const existing = await getTodayActivity(userId)
  
  if (existing) {
    await db.dailyActivities
      .where({ userId, date: today })
      .modify(updates)
  } else {
    await db.dailyActivities.add({
      date: today,
      userId,
      vocabularyNew: 0,
      vocabularyReviewed: 0,
      grammarLessons: 0,
      listeningMinutes: 0,
      speakingMinutes: 0,
      xpEarned: 0,
      goalReached: false,
      exercisesCompleted: 0,
      exercisesCorrect: 0,
      todayLessonSectionsCompleted: 0,
      todayLessonMinutes: 0,
      ...updates,
    })
  }
}

/**
 * Lấy lịch sử 30 ngày gần nhất
 */
export async function getRecentActivity(userId: string, days = 30): Promise<DailyActivity[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startStr = startDate.toISOString().split('T')[0]
  
  return db.dailyActivities
    .where('userId').equals(userId)
    .and(a => a.date >= startStr)
    .sortBy('date') as Promise<DailyActivity[]>
}

/**
 * Lấy user settings (singleton)
 */
export async function getUserSettings(): Promise<UserSettings | undefined> {
  const settings = await db.userSettings.toArray()
  return settings[0]
}

/**
 * Seed vocabulary data vào DB
 */
export async function seedVocabularyData(words: VocabWord[]): Promise<void> {
  const existingIds = await db.vocabWords.toCollection().primaryKeys()
  const newWords = words.filter(w => !existingIds.includes(w.id))
  if (newWords.length > 0) {
    await db.vocabWords.bulkAdd(newWords)
  }
}
