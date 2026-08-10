/**
 * TypeScript types cho EnglishUp
 * Định nghĩa tất cả types/interfaces dùng trong app
 */

// ========================
// USER & AUTH TYPES
// ========================
export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  authProvider?: 'google' | 'local'
  createdAt: Date
  currentPhase: LearningPhase
  currentWeek: number
  targetScore: 'IELTS' | 'TOEIC' | 'BOTH'
  learningMode: 'QUICK' | 'DEEP'
  dailyGoalMinutes: number
  timezone: string
}

export interface UserSettings {
  darkMode: boolean
  fontSize: 'small' | 'medium' | 'large'
  soundEnabled: boolean
  notificationsEnabled: boolean
  studyReminderTime: string // HH:mm
  geminiApiKey?: string // Lưu cục bộ, không lên server
}

// ========================
// LEARNING PHASE & ROADMAP
// ========================
export type LearningPhase = 'PHASE_0' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3'

export interface PhaseInfo {
  id: LearningPhase
  name: string
  level: string // A0, A1, A2, B1
  duration: string // '1-2 tuần'
  weeks: number
  description: string
  targetVocabulary: number
  targetGrammar: string[]
}

export interface WeekPlan {
  week: number
  phase: LearningPhase
  title: string
  vocabulary: VocabWord[]
  grammar: GrammarLesson[]
  listening: ListeningExercise[]
  speaking: SpeakingTopic[]
  reading: ReadingPassage[]
  writing: WritingTask[]
  miniTest: Exercise[]
}

// ========================
// VOCABULARY & SRS
// ========================
export interface VocabWord {
  id: string
  word: string
  pronunciation: string // IPA
  audio?: string // URL
  meaning: string // nghĩa tiếng Việt
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'phrase'
  examples: string[]
  examplesVi?: string[] // dịch nghĩa ví dụ
  image?: string
  tags: string[]
  phase: LearningPhase
  week: number
  difficulty: 1 | 2 | 3
}

// SRS Card - dựa trên thuật toán SM-2
export interface SRSCard {
  wordId: string
  userId: string
  // SM-2 params
  repetitions: number   // số lần lặp thành công
  easeFactor: number    // hệ số dễ (mặc định 2.5)
  interval: number      // interval ngày tiếp theo
  dueDate: Date
  lastReview?: Date
  quality?: 0 | 1 | 2 | 3 | 4 | 5 // chất lượng trả lời (0-5)
  isNew: boolean
  isMastered: boolean
}

// ========================
// LESSON CONTENT TYPES
// ========================
export interface GrammarLesson {
  id: string
  title: string
  titleVi: string
  explanation: string // tiếng Anh
  explanationVi: string // tiếng Việt - giải thích dễ hiểu
  structure: string // cấu trúc ngữ pháp
  examples: GrammarExample[]
  exercises: Exercise[]
  phase: LearningPhase
  week: number
  tags: string[]
}

export interface GrammarExample {
  sentence: string
  translation: string
  note?: string
}

export interface ListeningExercise {
  id: string
  title: string
  audioUrl: string
  transcript: string
  /** SSML portable for exporting to a cloud TTS tool; never sent to Gemini. */
  ssml?: string
  /** Short, line-by-line script learners can repeat after the recording. */
  shadowingCues?: string[]
  objectives?: string[]
  questions: ListeningQuestion[]
  difficulty: LearningPhase
  duration: number // giây
  topic: string
}

export interface ListeningQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // index
  explanation: string
}

export interface SpeakingTopic {
  id: string
  topic: string
  topicVi: string
  prompt: string
  promptVi: string
  sampleAnswer: string
  keywords: string[]
  difficulty: LearningPhase
}

export interface ReadingPassage {
  id: string
  title: string
  content: string
  questions: ReadingQuestion[]
  vocabulary: string[] // từ vựng quan trọng trong bài
  difficulty: LearningPhase
  wordCount: number
}

export interface ReadingQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

export interface WritingTask {
  id: string
  type: 'sentence' | 'paragraph' | 'email' | 'essay'
  prompt: string
  promptVi: string
  sampleAnswer: string
  wordLimit?: { min: number; max: number }
  criteria: string[]
  difficulty: LearningPhase
}

// ========================
// EXERCISES
// ========================
export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'matching'
  | 'ordering'
  | 'true_false'
  | 'listening_mc'
  | 'speaking_prompt'
  | 'writing_task'

export interface Exercise {
  id: string
  type: ExerciseType
  question: string
  questionVi?: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  explanationVi: string
  points: number
  timeLimit?: number // giây
  audioUrl?: string
  imageUrl?: string
}

// ========================
// USER PROGRESS
// ========================
export interface UserProgress {
  userId: string
  // Tổng quan
  totalXP: number
  currentStreak: number
  longestStreak: number
  lastStudyDate?: Date
  completedDays: number
  totalStudyMinutes: number
  // Theo kỹ năng
  vocabularyCount: number // số từ đã học
  masteredWordCount: number
  grammarLessonsCompleted: number
  listeningMinutes: number
  speakingMinutes: number
  readingWords: number
  writingTasksCompleted: number
  // Test scores
  testScores: TestScore[]
  estimatedIELTS?: number
  estimatedTOEIC?: number
}

export interface TestScore {
  id: string
  testType: 'mini_test' | 'mock_ielts' | 'mock_toeic'
  score: number
  maxScore: number
  date: Date
  details: Record<string, number>
  phase: LearningPhase
}

export interface DailyActivity {
  date: string // YYYY-MM-DD
  userId: string
  vocabularyNew: number
  vocabularyReviewed: number
  grammarLessons: number
  listeningMinutes: number
  speakingMinutes: number
  xpEarned: number
  goalReached: boolean
  exercisesCompleted: number
  exercisesCorrect: number
  /** Progress from the guided four-part lesson shown on the dashboard. */
  todayLessonSectionsCompleted: number
  /** Estimated learning time earned from completed guided lesson sections. */
  todayLessonMinutes: number
}

// ========================
// AI CHAT
// ========================
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
  error?: boolean
}

export interface AIFeedback {
  score: number // 0-10
  strengths: string[]
  improvements: string[]
  correctedText?: string
  pronunciation?: PronunciationFeedback
  suggestions: string[]
  overallComment: string
}

export interface PronunciationFeedback {
  overallScore: number
  fluency: number
  accuracy: number
  words: WordPronunciation[]
  tips: string[]
}

export interface WordPronunciation {
  word: string
  correct: boolean
  correction?: string
  ipa?: string
}

// ========================
// PLACEMENT TEST
// ========================
export interface PlacementTest {
  questions: PlacementQuestion[]
  totalQuestions: number
}

export interface PlacementQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  level: LearningPhase
  skill: 'vocabulary' | 'grammar' | 'reading'
}

export interface PlacementResult {
  score: number
  totalQuestions: number
  recommendedPhase: LearningPhase
  strengths: string[]
  weaknesses: string[]
}
