/**
 * Text-to-Speech service
 * Dùng Web Speech API để đọc tiếng Anh
 */

/**
 * Đọc text bằng giọng tiếng Anh
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(
  text: string,
  options?: {
    rate?: number  // 0.5 - 2.0, mặc định 1.0
    pitch?: number // 0 - 2, mặc định 1.0
    volume?: number // 0 - 1, mặc định 1.0
    lang?: string  // 'en-US' | 'en-GB'
  }
): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Web Speech API không được hỗ trợ trên trình duyệt này')
    return
  }

  // Dừng đang đọc (nếu có)
  stopSpeaking()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = options?.lang ?? 'en-US'
  utterance.rate = options?.rate ?? 1.0
  utterance.pitch = options?.pitch ?? 1.0
  utterance.volume = options?.volume ?? 1.0

  // Tìm giọng tiếng Anh tốt nhất
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
  ) ?? voices.find(v => v.lang.startsWith('en'))
  
  if (englishVoice) {
    utterance.voice = englishVoice
  }

  window.speechSynthesis.speak(utterance)
}

/**
 * Dừng đọc
 */
export function stopSpeaking(): void {
  speechRun += 1
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Kiểm tra đang đọc hay không
 */
export function isSpeaking(): boolean {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking
}

/**
 * Đọc với tốc độ chậm (cho học viên mới)
 */
export function speakSlow(text: string): void {
  speak(text, { rate: 0.7 })
}

type SsmlSegment = {
  text?: string
  pauseMs?: number
  rate?: number
  pitch?: number
}

let speechRun = 0

function normaliseRate(value?: string, inherited = 1): number {
  if (!value) return inherited
  const namedRates: Record<string, number> = { xslow: 0.55, slow: 0.75, medium: 1, fast: 1.2, xfast: 1.4 }
  if (value in namedRates) return namedRates[value]
  const percent = Number.parseFloat(value)
  return Number.isFinite(percent) && value.endsWith('%')
    ? Math.min(2, Math.max(0.5, inherited * (percent / 100)))
    : inherited
}

function parseBreak(value?: string): number {
  if (!value) return 500
  const amount = Number.parseFloat(value)
  if (!Number.isFinite(amount)) return 500
  return value.endsWith('s') && !value.endsWith('ms') ? amount * 1000 : amount
}

/** Converts SSML to readable text when a learner copies the script elsewhere. */
export function ssmlToPlainText(ssml: string): string {
  if (typeof DOMParser === 'undefined') return ssml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const document = new DOMParser().parseFromString(ssml, 'application/xml')
  return document.documentElement.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

function getSsmlSegments(ssml: string): SsmlSegment[] {
  if (typeof DOMParser === 'undefined') return [{ text: ssmlToPlainText(ssml) }]
  const document = new DOMParser().parseFromString(ssml, 'application/xml')
  if (document.querySelector('parsererror')) return [{ text: ssmlToPlainText(ssml) }]

  const segments: SsmlSegment[] = []
  const visit = (node: Node, rate = 1, pitch = 1) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      if (text) segments.push({ text, rate, pitch })
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const element = node as Element
    const tag = element.tagName.toLowerCase()
    if (tag === 'break') {
      segments.push({ pauseMs: parseBreak(element.getAttribute('time') ?? undefined) })
      return
    }
    const nextRate = tag === 'prosody' ? normaliseRate(element.getAttribute('rate') ?? undefined, rate) : rate
    const nextPitch = tag === 'emphasis' ? Math.min(1.2, pitch + 0.08) : pitch
    element.childNodes.forEach((child) => visit(child, nextRate, nextPitch))
  }

  visit(document.documentElement)
  return segments
}

/**
 * Reads an SSML transcript with the device's native Web Speech voice. This is
 * deliberately local: no Gemini TTS request is made from the Android/PWA app.
 */
export function speakSsml(ssml: string, onEnd?: () => void): boolean {
  if (!isSpeechSynthesisSupported()) return false

  const run = ++speechRun
  window.speechSynthesis.cancel()
  const segments = getSsmlSegments(ssml)
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find((voice) => voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Natural')))
    ?? voices.find((voice) => voice.lang.startsWith('en'))

  const playNext = (index: number) => {
    if (run !== speechRun) return
    const segment = segments[index]
    if (!segment) {
      onEnd?.()
      return
    }
    if (segment.pauseMs) {
      window.setTimeout(() => playNext(index + 1), segment.pauseMs)
      return
    }
    if (!segment.text) {
      playNext(index + 1)
      return
    }

    const utterance = new SpeechSynthesisUtterance(segment.text)
    utterance.lang = 'en-US'
    utterance.rate = segment.rate ?? 1
    utterance.pitch = segment.pitch ?? 1
    if (englishVoice) utterance.voice = englishVoice
    utterance.onend = () => playNext(index + 1)
    utterance.onerror = () => playNext(index + 1)
    window.speechSynthesis.speak(utterance)
  }

  playNext(0)
  return true
}
