/**
 * Review Page - Ôn tập thông minh SRS
 */
import { useState } from 'react'
import { RotateCw, CheckCircle, Sparkles, Volume2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { speak } from '@/services/speech/tts'

const SAMPLE_REVIEW_WORDS = [
  { id: 'r1', word: 'Environment', ipa: '/ɪnˈvaɪrənmənt/', meaning: 'Môi trường xung quanh', example: 'We must protect the environment.' },
  { id: 'r2', word: 'Opportunity', ipa: '/ˌɒpəˈtjuːnəti/', meaning: 'Cơ hội, thời cơ', example: 'Don\'t miss this great opportunity.' },
  { id: 'r3', word: 'Improve', ipa: '/ɪmˈpruːv/', meaning: 'Cải thiện, nâng cao', example: 'I want to improve my English speaking.' },
]

export default function ReviewPage() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  const currentWord = SAMPLE_REVIEW_WORDS[currentIndex]

  function handleRate(quality: number) {
    setIsFlipped(false)
    if (currentIndex < SAMPLE_REVIEW_WORDS.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setFinished(true)
    }
  }

  if (finished) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold">Hoàn thành phiên ôn tập!</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Bạn đã hoàn thành ôn tập tất cả các từ vựng cần thiết cho hôm nay.
        </p>
        <button
          onClick={() => navigate('/vocabulary')}
          className="w-full max-w-xs py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
        >
          Quay lại từ vựng
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-20 flex flex-col space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Ôn tập SRS ({currentIndex + 1}/{SAMPLE_REVIEW_WORDS.length})
        </span>
        <div className="w-8" />
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="flex-1 min-h-[340px] bg-card border border-border rounded-3xl p-6 flex flex-col justify-between items-center text-center cursor-pointer shadow-lg relative transition-all"
      >
        <div className="w-full flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation()
              speak(currentWord.word)
            }}
            className="p-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/80"
          >
            <Volume2 size={18} />
          </button>
        </div>

        <div className="my-auto space-y-3">
          <h2 className="text-3xl font-black text-brand-600 dark:text-brand-400">{currentWord.word}</h2>
          <p className="text-sm text-muted-foreground font-mono">{currentWord.ipa}</p>

          {isFlipped ? (
            <div className="pt-4 border-t border-border space-y-2 animate-fade-in">
              <p className="text-xl font-bold text-foreground">{currentWord.meaning}</p>
              <p className="text-xs text-muted-foreground italic">"{currentWord.example}"</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-4">
              <Sparkles size={14} /> Chạm để xem nghĩa
            </p>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground">
          {isFlipped ? 'Chọn mức độ nhớ bên dưới' : 'Thuật toán SM-2 cá nhân hóa'}
        </div>
      </div>

      {/* Review Actions */}
      {isFlipped ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleRate(1)}
            className="py-3 rounded-xl bg-destructive/15 text-destructive font-semibold text-sm border border-destructive/20"
          >
            Khó (1d)
          </button>
          <button
            onClick={() => handleRate(3)}
            className="py-3 rounded-xl bg-warning/15 text-warning-foreground font-semibold text-sm border border-warning/20"
          >
            Ổn (3d)
          </button>
          <button
            onClick={() => handleRate(5)}
            className="py-3 rounded-xl bg-success/15 text-success font-semibold text-sm border border-success/20"
          >
            Dễ (5d)
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsFlipped(true)}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
        >
          <RotateCw size={18} /> Lật mặt sau
        </button>
      )}
    </div>
  )
}
