/**
 * Utility functions - cn() helper cho Tailwind class merging
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format số thành dạng dễ đọc
 */
export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

/**
 * Format thời gian học (phút → giờ:phút)
 */
export function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`
}

/**
 * Tính % hoàn thành
 */
export function calcPercent(done: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.round((done / total) * 100))
}

/**
 * Tạo greeting theo giờ trong ngày
 */
export function getGreeting(name?: string): string {
  const hour = new Date().getHours()
  let greeting: string
  
  if (hour < 12) greeting = 'Chào buổi sáng'
  else if (hour < 18) greeting = 'Chào buổi chiều'
  else greeting = 'Chào buổi tối'
  
  return name ? `${greeting}, ${name}! 👋` : `${greeting}! 👋`
}

/**
 * Format ngày tháng tiếng Việt
 */
export function formatDateVi(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('vi-VN', options)
}

/**
 * Tính ngày streak liên tục
 */
export function calcStreakDays(dates: string[]): number {
  if (dates.length === 0) return 0
  
  const sorted = [...dates].sort().reverse()
  let streak = 1
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i])
    const prev = new Date(sorted[i + 1])
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

/**
 * Random shuffle array (Fisher-Yates)
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Sleep helper cho async/await
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Ước tính điểm IELTS từ tổng progress
 */
export function estimateIELTS(
  vocabCount: number,
  grammarLessons: number,
  testScores: number[]
): number {
  const vocabScore = Math.min(vocabCount / 3500 * 3, 3) // max 3 điểm
  const grammarScore = Math.min(grammarLessons / 50 * 2, 2) // max 2 điểm
  const avgTest = testScores.length > 0
    ? testScores.reduce((a, b) => a + b, 0) / testScores.length
    : 0
  const testScore = (avgTest / 100) * 2 // max 2 điểm (tổng max 7)
  
  const raw = 3.0 + vocabScore + grammarScore + testScore
  // Round về 0.5
  return Math.round(raw * 2) / 2
}
