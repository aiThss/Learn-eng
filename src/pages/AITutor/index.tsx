/**
 * AITutor - Trang Chat với gia sư AI
 * Giao diện chat đầy đủ, không có TopBar (đã ẩn trong AppShell)
 * Hỗ trợ Markdown cơ bản: **bold**, *italic*, \n cho xuống dòng
 */
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Send, RefreshCw, Wifi, WifiOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore, useUserStore, useSettingsStore } from '@/store'
import { chatWithTutor } from '@/services/ai/gemini'
import type { ChatMessage } from '@/types'

// ========================
// Gợi ý nhanh cho người dùng
// ========================
const QUICK_SUGGESTIONS = [
  'Giải thích Present Simple',
  'Kiểm tra bài viết',
  'Học từ vựng mới',
  'Ôn tập ngữ pháp',
]

// Tin nhắn chào mừng từ AI
const WELCOME_MESSAGE: Omit<ChatMessage, 'id' | 'timestamp'> = {
  role: 'assistant',
  content:
    'Xin chào! Tôi là gia sư AI của bạn. 🎓\n\nTôi có thể giúp bạn:\n- **Giải thích ngữ pháp** bằng tiếng Việt dễ hiểu\n- **Kiểm tra bài viết** và cho feedback chi tiết\n- **Học từ vựng** với ví dụ thực tế\n- **Trả lời câu hỏi** về tiếng Anh bất kỳ\n\nBạn muốn bắt đầu với điều gì? 😊',
}

// ========================
// Hàm render Markdown đơn giản (bold, italic, newline)
// ========================
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  return lines.map((line, lineIdx) => {
    const parts: React.ReactNode[] = []
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }
      if (match[1] !== undefined) {
        parts.push(
          <strong key={`b-${lineIdx}-${match.index}`} className="font-bold text-white">
            {match[1]}
          </strong>
        )
      } else if (match[2] !== undefined) {
        parts.push(
          <em key={`i-${lineIdx}-${match.index}`} className="italic text-gray-300">
            {match[2]}
          </em>
        )
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }

    return (
      <span key={lineIdx}>
        {parts.length > 0 ? parts : '\u00A0'}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    )
  })
}

// ========================
// Component: Bubble user (bên phải, màu xanh)
// ========================
function UserBubble({ msg }: { msg: ChatMessage }) {
  const time = new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div className="flex flex-col items-end gap-1 mb-4">
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm',
          'bg-gradient-to-br from-indigo-600 to-purple-700',
          'text-white text-sm leading-relaxed shadow-lg'
        )}
      >
        {msg.content}
      </div>
      <span className="text-[10px] text-gray-500 mr-1">{time}</span>
    </div>
  )
}

// ========================
// Component: Bubble AI (bên trái, dark card + avatar)
// ========================
function AIBubble({ msg, onRetry }: { msg: ChatMessage; onRetry?: () => void }) {
  const time = new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex items-start gap-3 mb-4">
      {/* Avatar bot */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="flex flex-col gap-1 max-w-[80%]">
        {/* Loading animation (ba chấm nhảy) */}
        {msg.isLoading ? (
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-800/80 border border-gray-700/50">
            <div className="flex gap-1.5 items-center h-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : msg.error ? (
          /* Error state - đỏ với nút retry */
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-red-900/30 border border-red-500/30">
            <p className="text-red-400 text-sm mb-2">⚠️ {msg.content}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Thử lại
              </button>
            )}
          </div>
        ) : (
          /* Tin nhắn AI bình thường */
          <div
            className={cn(
              'px-4 py-3 rounded-2xl rounded-tl-sm',
              'bg-gray-800/80 border border-gray-700/50',
              'text-gray-100 text-sm leading-relaxed shadow-md'
            )}
          >
            {renderMarkdown(msg.content)}
          </div>
        )}
        <span className="text-[10px] text-gray-500 ml-1">{time}</span>
      </div>
    </div>
  )
}

// ========================
// Trang chính AITutor
// ========================
export default function AITutor() {
  const navigate = useNavigate()
  const { messages, isLoading, addMessage, setLoading, updateLastMessage, clearChat } =
    useChatStore()
  const { user } = useUserStore()
  const { settings } = useSettingsStore()

  const [input, setInput] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastUserMsg, setLastUserMsg] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Theo dõi trạng thái mạng
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Hiển thị welcome message lần đầu
  useEffect(() => {
    if (messages.length === 0) {
      addMessage(WELCOME_MESSAGE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Gửi tin nhắn đến AI ──
  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setInput('')
    setLastUserMsg(trimmed)

    // Reset height textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Thêm tin nhắn user vào store
    addMessage({ role: 'user', content: trimmed })

    // Thêm placeholder loading
    addMessage({ role: 'assistant', content: '', isLoading: true })
    setLoading(true)

    try {
      // Chuẩn bị lịch sử chat (bỏ loading/error messages)
      const history = messages
        .filter((m) => !m.isLoading && !m.error)
        .map((m) => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: trimmed })

      // Map phase sang level string
      const levelMap: Record<string, string> = {
        PHASE_0: 'A0',
        PHASE_1: 'A1',
        PHASE_2: 'A2',
        PHASE_3: 'B1',
      }
      const userLevel = levelMap[user?.currentPhase ?? 'PHASE_0'] ?? 'A1'

      const result = await chatWithTutor(trimmed, history, userLevel)

      if (result.data) {
        updateLastMessage(result.data, false)
      } else {
        updateLastMessage(
          result.errorMessage || 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại.',
          true
        )
      }
    } catch {
      updateLastMessage(
        'Không thể kết nối. Kiểm tra mạng và API key trong Settings.',
        true
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Retry khi lỗi ──
  const handleRetry = () => {
    if (lastUserMsg) sendMessage(lastUserMsg)
  }

  // ── Enter gửi, Shift+Enter xuống dòng ──
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // ── Gợi ý nhanh ──
  const handleSuggestion = (suggestion: string) => sendMessage(suggestion)

  // ── Xóa chat + reset welcome ──
  const handleClearChat = () => {
    clearChat()
    setTimeout(() => addMessage(WELCOME_MESSAGE), 100)
  }

  const hasApiKey = !!(settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY)

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* ── Custom Header (TopBar bị ẩn cho route /ai-tutor) ── */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 bg-gray-900/95 border-b border-gray-800/60"
        style={{
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          paddingBottom: '12px',
        }}
      >
        {/* Bot Avatar + indicator online */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900',
              hasApiKey && isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
            )}
          />
        </div>

        {/* Tiêu đề + trạng thái */}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-base">Gia sư AI</h1>
          <div className="flex items-center gap-1.5">
            {hasApiKey && isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="text-[11px] text-green-400 font-medium">Trực tuyến</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span className="text-[11px] text-gray-500 truncate">
                  {!hasApiKey ? 'Chưa có API key · Vào Settings để thêm' : 'Offline'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Nút xóa chat */}
        <button
          onClick={handleClearChat}
          className="flex-shrink-0 p-2 rounded-xl bg-gray-800/60 text-gray-400 hover:text-foreground hover:bg-gray-700 transition-colors"
          title="Xóa lịch sử chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Danh sách tin nhắn (cuộn được) ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return <UserBubble key={msg.id} msg={msg} />
          }
          return (
            <AIBubble
              key={msg.id}
              msg={msg}
              onRetry={msg.error ? handleRetry : undefined}
            />
          )
        })}

        {/* Quick suggestions - hiện khi ít tin nhắn */}
        {!isLoading && messages.filter((m) => !m.isLoading).length <= 2 && (
          <div className="mt-4 mb-2">
            <p className="text-xs text-gray-500 mb-3 text-center">💡 Gợi ý câu hỏi:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium',
                    'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300',
                    'hover:bg-indigo-500/30 hover:text-foreground transition-all duration-200',
                    'active:scale-95'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Anchor để auto-scroll */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* ── Input area (keyboard safe area cho iOS) ── */}
      <div
        className="flex-shrink-0 bg-gray-900/95 border-t border-gray-800/60 px-4 pt-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {/* Cảnh báo chưa có API key */}
        {!hasApiKey && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-amber-900/30 border border-amber-500/30">
            <p className="text-amber-400 text-xs">
              ⚠️ Chưa có API key. Vào{' '}
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="font-bold focus-visible:underline"
              >
                Settings → AI & API
              </button>{' '}
              để thêm Gemini API key.
            </p>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Textarea input */}
          <div className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden focus-within:border-indigo-500/60 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi gia sư AI bất cứ điều gì..."
              rows={1}
              disabled={isLoading}
              className={cn(
                'w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500',
                'resize-none outline-none leading-relaxed',
                'disabled:opacity-50'
              )}
              style={{ maxHeight: '128px' }}
            />
          </div>

          {/* Nút gửi */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              'flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center',
              'bg-gradient-to-br from-indigo-500 to-purple-600',
              'text-white shadow-lg shadow-indigo-500/30',
              'transition-all duration-200 active:scale-90',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[10px] text-gray-600 text-center mt-2">
          Enter để gửi · Shift+Enter xuống dòng
        </p>
      </div>
    </div>
  )
}
