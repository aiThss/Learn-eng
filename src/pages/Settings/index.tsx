/**
 * Settings - Trang cài đặt ứng dụng
 * Quản lý: học tập, AI API key, giao diện, tài khoản
 */
import { useState, useEffect } from 'react'
import {
  User,
  BookOpen,
  Bot,
  Palette,
  Shield,
  Eye,
  EyeOff,
  ExternalLink,
  RotateCcw,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
  Check,
  Loader2,
  ChevronRight,
  Clock,
  Target,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore, useUserStore, useProgressStore } from '@/store'
import { callAI } from '@/services/ai/gemini'

// ========================
// Helper: Section header
// ========================
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{title}</h2>
    </div>
  )
}

// ========================
// Helper: Setting row
// ========================
function SettingRow({
  label,
  sublabel,
  children,
  onClick,
}: {
  label: string
  sublabel?: string
  children?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3.5',
        onClick && 'cursor-pointer hover:bg-gray-700/20 active:bg-gray-700/30 transition-colors'
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {children}
    </div>
  )
}

// ========================
// Helper: Toggle switch
// ========================
function Toggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-all duration-300',
        value ? 'bg-indigo-500' : 'bg-gray-600'
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300',
          value ? 'left-6' : 'left-0.5'
        )}
      />
    </button>
  )
}

// ========================
// Dialog xác nhận reset
// ========================
function ConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-lg font-black text-white text-center mb-2">Reset tiến trình?</h3>
        <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
          Toàn bộ tiến độ học tập, từ vựng đã học, và điểm số sẽ bị xóa vĩnh viễn. Bạn chắc chắn?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  )
}

// ========================
// Toast thông báo
// ========================
function Toast({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) {
  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl',
        'text-sm font-medium text-white',
        'animate-[slideUp_0.3s_ease]',
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      )}
    >
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {message}
    </div>
  )
}

// ========================
// Trang chính Settings
// ========================
export default function Settings() {
  const { settings, updateSettings, setApiKey } = useSettingsStore()
  const { user, updateUser } = useUserStore()
  const { setProgress } = useProgressStore()

  // Local state
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey ?? '')
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingApi, setTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState<'idle' | 'success' | 'error'>('idle')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [saved, setSaved] = useState(false)

  // Đồng bộ API key input
  useEffect(() => {
    setApiKeyInput(settings.geminiApiKey ?? '')
  }, [settings.geminiApiKey])

  // Hiển thị toast tạm thời
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Test kết nối API ──
  const handleTestApi = async () => {
    if (!apiKeyInput.trim()) {
      showToast('Vui lòng nhập API key trước', 'error')
      return
    }

    setTestingApi(true)
    setApiTestResult('idle')

    // Lưu key tạm để test
    const prevKey = import.meta.env.VITE_GEMINI_API_KEY
    try {
      // Lưu key vào settings trước khi test
      setApiKey(apiKeyInput.trim())
      const result = await callAI('Say "OK" in one word only.')
      if (result.data) {
        setApiTestResult('success')
        showToast('✅ Kết nối thành công! API key hoạt động.')
      } else {
        setApiTestResult('error')
        showToast(result.errorMessage || 'Kết nối thất bại', 'error')
      }
    } catch {
      setApiTestResult('error')
      showToast('Không thể kết nối API', 'error')
    } finally {
      setTestingApi(false)
    }
  }

  // ── Lưu tất cả settings ──
  const handleSave = () => {
    setApiKey(apiKeyInput.trim())
    setSaved(true)
    showToast('Đã lưu cài đặt!')
    setTimeout(() => setSaved(false), 2000)
  }

  // ── Reset tiến trình ──
  const handleReset = () => {
    setShowResetDialog(false)
    setProgress({
      userId: user?.id ?? 'local',
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      completedDays: 0,
      totalStudyMinutes: 0,
      vocabularyCount: 0,
      masteredWordCount: 0,
      grammarLessonsCompleted: 0,
      listeningMinutes: 0,
      speakingMinutes: 0,
      readingWords: 0,
      writingTasksCompleted: 0,
      testScores: [],
      estimatedIELTS: undefined,
      estimatedTOEIC: undefined,
    })
    showToast('Đã reset tiến trình học tập')
  }

  // Format ngày tham gia
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa có'

  const phaseLabel: Record<string, string> = {
    PHASE_0: 'A0 · Người mới',
    PHASE_1: 'A1 · Cơ bản',
    PHASE_2: 'A2 · Trung cấp',
    PHASE_3: 'B1 · Khá',
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-28">
      {/* ── Thẻ hồ sơ người dùng ── */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 px-4 pt-6 pb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">
              {user?.name ?? 'Người dùng'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                <span className="text-xs text-indigo-400 font-medium">
                  {phaseLabel[user?.currentPhase ?? 'PHASE_0']}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tham gia: {joinDate}</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* ── 1. HỌC TẬP ── */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <SectionHeader icon={BookOpen} title="Học tập" />
          </div>

          {/* Mục tiêu hàng ngày */}
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              Mục tiêu hàng ngày
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => updateUser({ dailyGoalMinutes: mins })}
                  className={cn(
                    'py-2.5 rounded-xl text-sm font-bold transition-all duration-150 border',
                    (user?.dailyGoalMinutes ?? 20) === mins
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-700/40 border-gray-700/50 text-gray-400 hover:border-gray-600'
                  )}
                >
                  {mins}'
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700/40 mx-4" />

          {/* Giờ nhắc nhở */}
          <SettingRow
            label="Giờ nhắc học"
            sublabel={`Nhắc nhở lúc ${settings.studyReminderTime}`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <input
                type="time"
                value={settings.studyReminderTime}
                onChange={(e) => updateSettings({ studyReminderTime: e.target.value })}
                className="bg-gray-700/60 border border-gray-600/50 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-indigo-500/60"
              />
            </div>
          </SettingRow>

          <div className="border-t border-gray-700/40 mx-4" />

          {/* Chế độ học */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Chế độ học
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['QUICK', 'DEEP'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => updateUser({ learningMode: m })}
                  className={cn(
                    'py-2.5 rounded-xl text-sm font-bold transition-all duration-150 border',
                    (user?.learningMode ?? 'QUICK') === m
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-700/40 border-gray-700/50 text-gray-400 hover:border-gray-600'
                  )}
                >
                  {m === 'QUICK' ? '⚡ Nhanh' : '🔍 Sâu'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2. AI & API ── */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <SectionHeader icon={Bot} title="AI & API" />
          </div>

          {/* Gemini API key input */}
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Gemini API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-gray-700/60 border border-gray-600/50 rounded-xl overflow-hidden focus-within:border-indigo-500/60 transition-colors">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Test connection */}
            <button
              onClick={handleTestApi}
              disabled={testingApi || !apiKeyInput.trim()}
              className={cn(
                'w-full py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200',
                'flex items-center justify-center gap-2',
                apiTestResult === 'success'
                  ? 'bg-green-900/30 border-green-500/40 text-green-400'
                  : apiTestResult === 'error'
                  ? 'bg-red-900/30 border-red-500/40 text-red-400'
                  : 'bg-gray-700/40 border-gray-600/50 text-gray-300 hover:border-gray-500 disabled:opacity-40'
              )}
            >
              {testingApi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : apiTestResult === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  Kết nối thành công!
                </>
              ) : apiTestResult === 'error' ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Kết nối thất bại
                </>
              ) : (
                'Kiểm tra kết nối'
              )}
            </button>

            {/* Link lấy API key */}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1"
            >
              <ExternalLink className="w-3 h-3" />
              Lấy API key miễn phí tại Google AI Studio
            </a>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              🔒 API key được lưu cục bộ trên thiết bị của bạn, không chia sẻ lên server.
            </p>
          </div>
        </div>

        {/* ── 3. GIAO DIỆN ── */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden divide-y divide-gray-700/40">
          <div className="px-4 pt-4 pb-2">
            <SectionHeader icon={Palette} title="Giao diện" />
          </div>

          {/* Dark/Light mode */}
          <SettingRow
            label="Chế độ tối"
            sublabel={settings.darkMode ? 'Dark mode đang bật' : 'Light mode đang bật'}
          >
            <div className="flex items-center gap-2">
              {settings.darkMode ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <Toggle
                value={settings.darkMode}
                onChange={(v) => updateSettings({ darkMode: v })}
              />
            </div>
          </SettingRow>

          {/* Font size */}
          <div className="px-4 py-3">
            <p className="text-xs text-gray-400 mb-2">Cỡ chữ</p>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ fontSize: size })}
                  className={cn(
                    'py-2 rounded-xl text-sm font-medium border transition-all',
                    settings.fontSize === size
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-700/40 border-gray-700/50 text-gray-400 hover:border-gray-600'
                  )}
                  style={{
                    fontSize: size === 'small' ? '11px' : size === 'large' ? '15px' : '13px',
                  }}
                >
                  {size === 'small' ? 'Nhỏ' : size === 'large' ? 'Lớn' : 'Vừa'}
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <SettingRow
            label="Âm thanh"
            sublabel={settings.soundEnabled ? 'Bật âm thanh học tập' : 'Tắt âm thanh'}
          >
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-green-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
              <Toggle
                value={settings.soundEnabled}
                onChange={(v) => updateSettings({ soundEnabled: v })}
              />
            </div>
          </SettingRow>

          {/* Notifications */}
          <SettingRow
            label="Thông báo"
            sublabel={settings.notificationsEnabled ? 'Nhận nhắc nhở học tập' : 'Tắt thông báo'}
          >
            <div className="flex items-center gap-2">
              <Bell className={cn('w-4 h-4', settings.notificationsEnabled ? 'text-amber-400' : 'text-gray-500')} />
              <Toggle
                value={settings.notificationsEnabled}
                onChange={(v) => updateSettings({ notificationsEnabled: v })}
              />
            </div>
          </SettingRow>
        </div>

        {/* ── 4. TÀI KHOẢN ── */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden divide-y divide-gray-700/40">
          <div className="px-4 pt-4 pb-2">
            <SectionHeader icon={Shield} title="Tài khoản" />
          </div>

          {/* Reset progress */}
          <SettingRow
            label="Reset tiến trình"
            sublabel="Xóa toàn bộ dữ liệu học tập"
            onClick={() => setShowResetDialog(true)}
          >
            <div className="flex items-center gap-1.5 text-red-400">
              <RotateCcw className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
            </div>
          </SettingRow>

          {/* App version */}
          <SettingRow label="Phiên bản ứng dụng" sublabel="EnglishUp">
            <span className="text-sm text-gray-500 font-mono">v1.0.0</span>
          </SettingRow>
        </div>

        {/* ── Nút Lưu ── */}
        <button
          onClick={handleSave}
          className={cn(
            'w-full py-4 rounded-2xl font-black text-white text-base transition-all duration-200',
            saved
              ? 'bg-green-600 active:scale-[0.98]'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98]',
            'flex items-center justify-center gap-2 shadow-lg'
          )}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Đã lưu!
            </>
          ) : (
            'Lưu cài đặt'
          )}
        </button>
      </div>

      {/* Dialog xác nhận reset */}
      {showResetDialog && (
        <ConfirmDialog
          onConfirm={handleReset}
          onCancel={() => setShowResetDialog(false)}
        />
      )}

      {/* Toast thông báo */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
