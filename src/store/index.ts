/**
 * Zustand Stores cho EnglishUp
 * State management toàn ứng dụng
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  User,
  UserSettings,
  UserProgress,
  LearningPhase,
  ChatMessage,
  SRSCard,
  DailyActivity,
} from '@/types'

// ========================
// USER STORE
// ========================
interface UserStore {
  user: User | null
  isOnboarded: boolean
  
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  completeOnboarding: (user: User) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,
      
      setUser: (user) => set({ user }),
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      
      completeOnboarding: (user) =>
        set({ user, isOnboarded: true }),
      
      clearUser: () => set({ user: null, isOnboarded: false }),
    }),
    {
      name: 'englishup-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ========================
// SETTINGS STORE
// ========================
interface SettingsStore {
  settings: UserSettings
  
  updateSettings: (updates: Partial<UserSettings>) => void
  toggleDarkMode: () => void
  setApiKey: (key: string) => void
}

const defaultSettings: UserSettings = {
  darkMode: true, // Mặc định dark mode
  fontSize: 'medium',
  soundEnabled: true,
  notificationsEnabled: true,
  studyReminderTime: '20:00',
  geminiApiKey: '',
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      
      toggleDarkMode: () =>
        set((state) => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode },
        })),
      
      setApiKey: (key) =>
        set((state) => ({
          settings: { ...state.settings, geminiApiKey: key },
        })),
    }),
    {
      name: 'englishup-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ========================
// PROGRESS STORE
// ========================
interface ProgressStore {
  progress: UserProgress | null
  todayActivity: DailyActivity | null
  
  setProgress: (progress: UserProgress) => void
  addXP: (xp: number) => void
  updateStreak: (lastDate: Date) => void
  updateTodayActivity: (updates: Partial<DailyActivity>) => void
  incrementVocab: (isNew?: boolean) => void
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: null,
      todayActivity: null,
      
      setProgress: (progress) => set({ progress }),
      
      addXP: (xp) =>
        set((state) => ({
          progress: state.progress
            ? { ...state.progress, totalXP: state.progress.totalXP + xp }
            : null,
          todayActivity: state.todayActivity
            ? { ...state.todayActivity, xpEarned: state.todayActivity.xpEarned + xp }
            : null,
        })),
      
      updateStreak: (lastDate) => {
        const today = new Date()
        const last = new Date(lastDate)
        const diffDays = Math.floor(
          (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        set((state) => {
          if (!state.progress) return {}
          
          let newStreak = state.progress.currentStreak
          if (diffDays === 1) {
            newStreak += 1 // Tiếp tục streak
          } else if (diffDays > 1) {
            newStreak = 1 // Reset streak
          }
          
          return {
            progress: {
              ...state.progress,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.progress.longestStreak),
              lastStudyDate: today,
            },
          }
        })
      },
      
      updateTodayActivity: (updates) =>
        set((state) => ({
          todayActivity: state.todayActivity
            ? { ...state.todayActivity, ...updates }
            : { ...createEmptyDailyActivity(), ...updates },
        })),
      
      incrementVocab: (isNew = false) =>
        set((state) => ({
          progress: state.progress
            ? {
                ...state.progress,
                vocabularyCount: isNew
                  ? state.progress.vocabularyCount + 1
                  : state.progress.vocabularyCount,
              }
            : null,
          todayActivity: state.todayActivity
            ? {
                ...state.todayActivity,
                vocabularyNew: isNew
                  ? state.todayActivity.vocabularyNew + 1
                  : state.todayActivity.vocabularyNew,
                vocabularyReviewed: !isNew
                  ? state.todayActivity.vocabularyReviewed + 1
                  : state.todayActivity.vocabularyReviewed,
              }
            : null,
        })),
    }),
    {
      name: 'englishup-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ========================
// LESSON STORE (không persist - load lại mỗi session)
// ========================
interface LessonStore {
  currentPhase: LearningPhase
  currentWeek: number
  srsCards: SRSCard[]
  dueCardsCount: number
  newWordsCount: number
  
  setPhase: (phase: LearningPhase) => void
  setWeek: (week: number) => void
  setSRSCards: (cards: SRSCard[]) => void
  updateDueCount: () => void
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  currentPhase: 'PHASE_0',
  currentWeek: 1,
  srsCards: [],
  dueCardsCount: 0,
  newWordsCount: 0,
  
  setPhase: (phase) => set({ currentPhase: phase }),
  setWeek: (week) => set({ currentWeek: week }),
  
  setSRSCards: (cards) => {
    const now = new Date()
    const due = cards.filter(c => new Date(c.dueDate) <= now && !c.isMastered)
    const newCards = cards.filter(c => c.isNew)
    set({ srsCards: cards, dueCardsCount: due.length, newWordsCount: newCards.length })
  },
  
  updateDueCount: () => {
    const { srsCards } = get()
    const now = new Date()
    const due = srsCards.filter(c => new Date(c.dueDate) <= now && !c.isMastered)
    set({ dueCardsCount: due.length })
  },
}))

// ========================
// AI CHAT STORE
// ========================
interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  sessionId: string
  
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setLoading: (loading: boolean) => void
  clearChat: () => void
  updateLastMessage: (content: string, error?: boolean) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  sessionId: crypto.randomUUID(),
  
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearChat: () =>
    set({ messages: [], sessionId: crypto.randomUUID() }),
  
  updateLastMessage: (content, error = false) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = {
          ...last,
          content,
          isLoading: false,
          error,
        }
      }
      return { messages }
    }),
}))

// ========================
// HELPER
// ========================
function createEmptyDailyActivity(): DailyActivity {
  return {
    date: new Date().toISOString().split('T')[0],
    userId: 'local',
    vocabularyNew: 0,
    vocabularyReviewed: 0,
    grammarLessons: 0,
    listeningMinutes: 0,
    speakingMinutes: 0,
    xpEarned: 0,
    goalReached: false,
    exercisesCompleted: 0,
    exercisesCorrect: 0,
  }
}
