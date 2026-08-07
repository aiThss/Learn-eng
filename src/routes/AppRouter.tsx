/**
 * App Router - Cấu hình React Router v6
 * Multi-page architecture với history API
 * Chống mất trang khi back bằng React Router + Zustand state
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from '@/store'
import AppShell from '@/components/layout/AppShell'

// Lazy load các trang để tối ưu performance
import { lazy, Suspense } from 'react'
import LoadingScreen from '@/components/ui/LoadingScreen'

const OnboardingPage = lazy(() => import('@/pages/Onboarding'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const RoadmapPage = lazy(() => import('@/pages/Roadmap'))
const TodayLessonPage = lazy(() => import('@/pages/TodayLesson'))
const VocabularyPage = lazy(() => import('@/pages/Vocabulary'))
const GrammarPage = lazy(() => import('@/pages/Grammar'))
const ListeningPage = lazy(() => import('@/pages/Listening'))
const SpeakingPage = lazy(() => import('@/pages/Speaking'))
const ReadingWritingPage = lazy(() => import('@/pages/ReadingWriting'))
const PracticePage = lazy(() => import('@/pages/Practice'))
const ProgressPage = lazy(() => import('@/pages/Progress'))
const AITutorPage = lazy(() => import('@/pages/AITutor'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const ReviewPage = lazy(() => import('@/pages/Review'))

/**
 * Guard: Redirect về Onboarding nếu chưa setup
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useUserStore()
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

/**
 * Guard: Redirect về Dashboard nếu đã onboarded
 */
function RequireGuest({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useUserStore()
  if (isOnboarded) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Onboarding - không có AppShell */}
        <Route
          path="/onboarding"
          element={
            <RequireGuest>
              <OnboardingPage />
            </RequireGuest>
          }
        />

        {/* Tất cả trang chính - có AppShell với nav */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/lesson/today" element={<TodayLessonPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/grammar" element={<GrammarPage />} />
          <Route path="/listening" element={<ListeningPage />} />
          <Route path="/speaking" element={<SpeakingPage />} />
          <Route path="/reading-writing" element={<ReadingWritingPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/ai-tutor" element={<AITutorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
