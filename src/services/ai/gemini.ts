/**
 * Gemini AI Service cho EnglishUp
 * Tích hợp Google Gemini API với rate limiting và fallback
 */
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'
import { PROMPTS } from './prompts'

// Rate limiter: tối đa 10 requests/phút
class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    // Xóa requests cũ hơn window
    this.requests = this.requests.filter(t => now - t < this.windowMs)
    return this.requests.length < this.maxRequests
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0
    const oldest = Math.min(...this.requests)
    return this.windowMs - (Date.now() - oldest)
  }
}

const rateLimiter = new RateLimiter(10, 60000)

// Khởi tạo Gemini client (lazy)
let genAI: GoogleGenerativeAI | null = null
let model: GenerativeModel | null = null

function getModel(): GenerativeModel | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
    // Dùng gemini-1.5-flash chuẩn Google API
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }
  
  return model
}

// Error types
export type AIError = 'RATE_LIMIT' | 'NO_API_KEY' | 'NETWORK_ERROR' | 'UNKNOWN'

export interface AIResult<T> {
  data?: T
  error?: AIError
  errorMessage?: string
  isFallback?: boolean
}

/**
 * Hàm gọi AI với error handling và rate limiting
 */
async function callAI(prompt: string): Promise<AIResult<string>> {
  const currentModel = getModel()
  
  if (!currentModel) {
    return { error: 'NO_API_KEY', errorMessage: 'Chưa cài API key', isFallback: true }
  }
  
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(rateLimiter.getWaitTime() / 1000)
    return { 
      error: 'RATE_LIMIT', 
      errorMessage: `Đã dùng hết giới hạn. Vui lòng đợi ${waitTime} giây.`,
      isFallback: true
    }
  }
  
  try {
    rateLimiter.recordRequest()
    const result = await currentModel.generateContent(prompt)
    const text = result.response.text()
    return { data: text }
  } catch (error) {
    console.error('Gemini API error:', error)
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    
    if (message.includes('quota') || message.includes('429')) {
      return { error: 'RATE_LIMIT', errorMessage: 'Vượt quota API', isFallback: true }
    }
    
    return { error: 'NETWORK_ERROR', errorMessage: message, isFallback: true }
  }
}

// ========================
// AI FEATURES
// ========================

/**
 * Giải thích ngữ pháp bằng tiếng Việt
 */
export async function explainGrammar(
  grammarPoint: string,
  level: string = 'A1'
): Promise<AIResult<string>> {
  const prompt = PROMPTS.explainGrammar(grammarPoint, level)
  const result = await callAI(prompt)
  
  if (result.isFallback) {
    return { ...result, data: FALLBACKS.grammarExplanation(grammarPoint) }
  }
  
  return result
}

/**
 * Chấm bài Speaking và cho feedback
 */
export async function gradeSpeaking(
  transcript: string,
  topic: string,
  level: string = 'A1'
): Promise<AIResult<string>> {
  const prompt = PROMPTS.gradeSpeaking(transcript, topic, level)
  const result = await callAI(prompt)
  
  if (result.isFallback) {
    return { ...result, data: FALLBACKS.speakingFeedback }
  }
  
  return result
}

/**
 * Chấm bài Writing và cho feedback
 */
export async function gradeWriting(
  essay: string,
  prompt_: string,
  level: string = 'A2'
): Promise<AIResult<string>> {
  const aiPrompt = PROMPTS.gradeWriting(essay, prompt_, level)
  const result = await callAI(aiPrompt)
  
  if (result.isFallback) {
    return { ...result, data: FALLBACKS.writingFeedback }
  }
  
  return result
}

/**
 * Tạo ví dụ câu cho từ vựng
 */
export async function generateVocabExamples(
  word: string,
  meaning: string,
  level: string = 'A1'
): Promise<AIResult<string>> {
  const prompt = PROMPTS.generateVocabExamples(word, meaning, level)
  const result = await callAI(prompt)
  
  if (result.isFallback) {
    return { ...result, data: FALLBACKS.vocabExamples(word) }
  }
  
  return result
}

/**
 * Giải thích lỗi sai trong bài tập
 */
export async function explainMistake(
  userAnswer: string,
  correctAnswer: string,
  question: string
): Promise<AIResult<string>> {
  const prompt = PROMPTS.explainMistake(userAnswer, correctAnswer, question)
  const result = await callAI(prompt)
  
  if (result.isFallback) {
    return { ...result, data: FALLBACKS.mistakeExplanation(userAnswer, correctAnswer) }
  }
  
  return result
}

/**
 * AI Tutor chat - trả lời câu hỏi của học sinh
 */
export async function chatWithTutor(
  userMessage: string,
  chatHistory: Array<{ role: string; content: string }>,
  userLevel: string = 'A1'
): Promise<AIResult<string>> {
  const prompt = PROMPTS.chatTutor(userMessage, chatHistory, userLevel)
  const result = await callAI(prompt)
  
  if (result.isFallback) {
    return { ...result, data: FALLBACKS.tutorResponse }
  }
  
  return result
}

/**
 * Tạo câu hỏi luyện tập động
 */
export async function generatePracticeQuestions(
  topic: string,
  level: string,
  count: number = 5
): Promise<AIResult<string>> {
  const prompt = PROMPTS.generateQuestions(topic, level, count)
  const result = await callAI(prompt)
  
  if (result.isFallback) {
    return { ...result, data: FALLBACKS.practiceQuestions }
  }
  
  return result
}

// ========================
// FALLBACK RESPONSES
// (Khi AI không khả dụng)
// ========================
const FALLBACKS = {
  grammarExplanation: (grammar: string) => `
**${grammar}** là một điểm ngữ pháp quan trọng trong tiếng Anh.

*Hiện tại AI không khả dụng. Vui lòng kiểm tra kết nối mạng hoặc API key.*

Bạn có thể xem giải thích offline trong phần Grammar bên dưới.
  `.trim(),
  
  speakingFeedback: `
**Phản hồi Speaking (Offline)**

Hiện tại AI feedback không khả dụng. Một số gợi ý chung:
- Nói chậm và rõ ràng
- Chú ý phát âm các âm cuối
- Dùng câu đơn giản, ngắn gọn
- Luyện tập thường xuyên mỗi ngày

*Kết nối mạng và API key để nhận feedback chi tiết từ AI.*
  `.trim(),
  
  writingFeedback: `
**Phản hồi Writing (Offline)**

Hiện tại AI feedback không khả dụng. Tiêu chí chấm điểm:
- Task Achievement: Hoàn thành yêu cầu đề bài
- Coherence: Câu văn liên kết rõ ràng
- Lexical Resource: Từ vựng đa dạng
- Grammar: Cấu trúc câu chính xác

*Kết nối mạng và API key để nhận feedback chi tiết từ AI.*
  `.trim(),
  
  vocabExamples: (word: string) => `
**Ví dụ câu với "${word}"** (offline mode):

Hiện tại AI không khả dụng. Tra từ điển để có ví dụ câu đầy đủ.
  `.trim(),
  
  mistakeExplanation: (wrong: string, correct: string) => `
**Giải thích lỗi sai (offline)**:
- Bạn điền: **${wrong}**
- Đáp án đúng: **${correct}**

*Kết nối mạng để nhận giải thích chi tiết từ AI.*
  `.trim(),
  
  tutorResponse: `
Xin chào! Tôi là gia sư AI của EnglishUp. 

*Hiện tại tôi không thể kết nối. Vui lòng kiểm tra kết nối mạng và API key trong Settings.*

Trong khi đó, bạn có thể:
- Ôn luyện từ vựng với Flashcard
- Học Grammar có sẵn
- Làm bài tập Practice
  `.trim(),
  
  practiceQuestions: `{"error": "offline", "message": "AI không khả dụng"}`,
}

export { callAI }
