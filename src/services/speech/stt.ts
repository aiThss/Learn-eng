/**
 * Speech-to-Text service
 * Dùng Web Speech API để nhận dạng giọng nói tiếng Anh
 */

// Type declaration cho Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export type STTStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export interface STTResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface STTCallbacks {
  onStart?: () => void
  onResult?: (result: STTResult) => void
  onEnd?: () => void
  onError?: (error: string) => void
}

let recognition: SpeechRecognition | null = null

/**
 * Kiểm tra trình duyệt có hỗ trợ STT không
 */
export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

/**
 * Bắt đầu ghi âm và nhận dạng giọng nói
 */
export function startRecording(callbacks: STTCallbacks): void {
  if (!isSpeechRecognitionSupported()) {
    callbacks.onError?.('Trình duyệt không hỗ trợ nhận dạng giọng nói')
    return
  }

  // Dừng recording cũ nếu có
  stopRecording()

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognitionAPI()

  recognition.lang = 'en-US'
  recognition.continuous = false      // Dừng sau khi im lặng
  recognition.interimResults = true   // Hiển thị kết quả tạm
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    callbacks.onStart?.()
  }

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = ''
    let confidence = 0
    let isFinal = false

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      transcript += result[0].transcript
      confidence = result[0].confidence
      isFinal = result.isFinal
    }

    callbacks.onResult?.({ transcript, confidence, isFinal })
  }

  recognition.onend = () => {
    recognition = null
    callbacks.onEnd?.()
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    let errorMsg = 'Lỗi nhận dạng giọng nói'
    
    switch (event.error) {
      case 'not-allowed':
        errorMsg = 'Vui lòng cấp quyền microphone'
        break
      case 'no-speech':
        errorMsg = 'Không nghe thấy giọng nói'
        break
      case 'network':
        errorMsg = 'Lỗi mạng - vui lòng kiểm tra kết nối'
        break
      case 'audio-capture':
        errorMsg = 'Không tìm thấy microphone'
        break
    }
    
    callbacks.onError?.(errorMsg)
    recognition = null
  }

  recognition.start()
}

/**
 * Dừng ghi âm
 */
export function stopRecording(): void {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}

/**
 * Kiểm tra đang ghi âm không
 */
export function isRecording(): boolean {
  return recognition !== null
}
