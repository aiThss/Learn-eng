/**
 * LoadingScreen - Màn hình chờ đẹp khi app khởi động
 * Hiển thị logo, tên app và animation loading
 */
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  className?: string
}

export default function LoadingScreen({ className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-gray-950',
        className
      )}
    >
      {/* Vòng sáng phía sau logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl scale-150 animate-pulse" />

        {/* Logo chữ E với gradient */}
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-[bounce_2s_ease-in-out_infinite]">
          <span className="text-5xl font-black text-white select-none">E</span>
        </div>
      </div>

      {/* Tên app với gradient */}
      <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
        EnglishUp
      </h1>

      {/* Tagline */}
      <p className="text-gray-400 text-sm font-medium mb-10 tracking-wide">
        Học tiếng Anh thông minh
      </p>

      {/* Loading dots animation */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"
            style={{
              animation: `loadingDot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* CSS animation inline cho loading dots */}
      <style>{`
        @keyframes loadingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
