/**
 * Text-to-Speech service
 * Dùng Web Speech API để đọc tiếng Anh
 */

/**
 * Đọc text bằng giọng tiếng Anh
 */
export function speak(
  text: string,
  options?: {
    rate?: number  // 0.5 - 2.0, mặc định 1.0
    pitch?: number // 0 - 2, mặc định 1.0
    volume?: number // 0 - 1, mặc định 1.0
    lang?: string  // 'en-US' | 'en-GB'
  }
): void {
  if (!('speechSynthesis' in window)) {
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
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Kiểm tra đang đọc hay không
 */
export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking
}

/**
 * Đọc với tốc độ chậm (cho học viên mới)
 */
export function speakSlow(text: string): void {
  speak(text, { rate: 0.7 })
}
