/**
 * Prompt Engineering cho Gemini AI
 * Tất cả prompts được viết cẩn thận để AI trả lời tiếng Việt tự nhiên
 */

const SYSTEM_CONTEXT = `
Bạn là gia sư tiếng Anh AI của ứng dụng EnglishUp. 
Đối tượng học viên: người Việt Nam, mất gốc hoặc mới bắt đầu, mục tiêu đạt B1 IELTS.
LUÔN trả lời bằng tiếng Việt, thân thiện và dễ hiểu.
Dùng ví dụ thực tế, gần gũi với cuộc sống người Việt.
Tránh từ ngữ kỹ thuật phức tạp khi không cần thiết.
Markdown được hỗ trợ trong câu trả lời.
`

export const PROMPTS = {
  /**
   * Giải thích điểm ngữ pháp
   */
  explainGrammar: (grammarPoint: string, level: string) => `
${SYSTEM_CONTEXT}

Giải thích điểm ngữ pháp sau cho học viên cấp độ ${level}:
**${grammarPoint}**

Yêu cầu:
1. Giải thích ngắn gọn, dễ hiểu (2-3 câu)
2. Đưa ra công thức/cấu trúc rõ ràng
3. Cho 3-4 ví dụ thực tế (có dịch nghĩa tiếng Việt)
4. Nêu lỗi sai thường gặp và cách tránh
5. Mẹo nhớ nhanh (nếu có)

Format trả lời bằng Markdown.
  `.trim(),

  /**
   * Chấm bài Speaking
   */
  gradeSpeaking: (transcript: string, topic: string, level: string) => `
${SYSTEM_CONTEXT}

Chấm bài nói tiếng Anh của học viên cấp độ ${level}.
Chủ đề: **${topic}**

Bài nói của học viên:
"""
${transcript}
"""

Đánh giá theo các tiêu chí sau (thang điểm 1-10):
1. **Nội dung** (có liên quan đến chủ đề không?)
2. **Ngữ pháp** (cấu trúc câu đúng không?)
3. **Từ vựng** (phong phú và phù hợp không?)
4. **Phát âm** (dựa trên transcript, đoán các từ khó phát âm)
5. **Sự tự nhiên** (câu văn flow không?)

Feedback:
- Điểm mạnh cụ thể
- Điểm cần cải thiện + ví dụ sửa
- Điểm tổng thể
- Gợi ý câu hay hơn (rewrite 1-2 câu)

Hãy động viên và tích cực, tránh làm nản lòng học viên.
  `.trim(),

  /**
   * Chấm bài Writing
   */
  gradeWriting: (essay: string, prompt: string, level: string) => `
${SYSTEM_CONTEXT}

Chấm bài viết tiếng Anh của học viên cấp độ ${level}.
Đề bài: **${prompt}**

Bài viết:
"""
${essay}
"""

Đánh giá theo 4 tiêu chí IELTS Writing:
1. **Task Achievement** (đáp ứng yêu cầu đề bài?)
2. **Coherence & Cohesion** (mạch văn rõ ràng, liên kết tốt?)
3. **Lexical Resource** (từ vựng đa dạng, chính xác?)
4. **Grammatical Range** (ngữ pháp đa dạng, ít lỗi?)

Output:
- Điểm từng tiêu chí (1-10)
- Điểm IELTS ước tính (ví dụ: 4.0)
- Highlight lỗi sai quan trọng (tối đa 5 lỗi)
- Sửa lỗi với giải thích ngắn
- Phiên bản cải thiện của một đoạn văn mẫu
- Gợi ý cho lần viết tiếp theo
  `.trim(),

  /**
   * Tạo ví dụ câu cho từ vựng
   */
  generateVocabExamples: (word: string, meaning: string, level: string) => `
${SYSTEM_CONTEXT}

Tạo nội dung học từ vựng cho từ: **"${word}"** (nghĩa: ${meaning})
Cấp độ học viên: ${level}

Tạo:
1. 3 ví dụ câu tự nhiên (độ phức tạp tăng dần), kèm dịch nghĩa
2. Collocations phổ biến (từ đi kèm)
3. Phân biệt với từ đồng nghĩa thường bị nhầm (nếu có)
4. Mẹo nhớ từ thú vị (mnemonics, câu chuyện, hình ảnh)
5. Tình huống dùng từ này trong cuộc sống thực

Dùng ví dụ gần gũi với người Việt Nam (công việc, gia đình, cuộc sống hàng ngày).
  `.trim(),

  /**
   * Giải thích lỗi sai
   */
  explainMistake: (wrong: string, correct: string, question: string) => `
${SYSTEM_CONTEXT}

Học viên làm bài tập và trả lời sai. Hãy giải thích lỗi sai một cách thân thiện.

Câu hỏi: ${question}
Câu trả lời của học viên: **${wrong}**
Đáp án đúng: **${correct}**

Giải thích:
1. Tại sao "${wrong}" sai?
2. Tại sao "${correct}" là đúng?
3. Quy tắc ngữ pháp/ngữ nghĩa liên quan
4. Ví dụ thêm để củng cố
5. Mẹo để không mắc lỗi tương tự

Giải thích ngắn gọn (tối đa 150 từ), dùng tiếng Việt dễ hiểu.
  `.trim(),

  /**
   * AI Tutor chat
   */
  chatTutor: (
    message: string,
    history: Array<{ role: string; content: string }>,
    level: string
  ) => {
    const historyText = history
      .slice(-6) // Chỉ lấy 6 tin nhắn gần nhất để tiết kiệm token
      .map(h => `${h.role === 'user' ? 'Học viên' : 'Gia sư'}: ${h.content}`)
      .join('\n')

    return `
${SYSTEM_CONTEXT}
Trình độ học viên hiện tại: ${level}

Lịch sử hội thoại gần đây:
${historyText || '(Bắt đầu cuộc trò chuyện mới)'}

Học viên hỏi: ${message}

Trả lời với tư cách gia sư tiếng Anh:
- Thân thiện, kiên nhẫn như người thầy thực sự
- Nếu câu hỏi về tiếng Anh: giải thích cụ thể + ví dụ
- Nếu hỏi về lộ trình học: tư vấn phù hợp cấp độ ${level}
- Độ dài phù hợp (không quá ngắn, không quá dài)
- Kết thúc bằng câu hỏi/gợi ý để tiếp tục học (nếu phù hợp)
    `.trim()
  },

  /**
   * Tạo câu hỏi luyện tập
   */
  generateQuestions: (topic: string, level: string, count: number) => `
${SYSTEM_CONTEXT}

Tạo ${count} câu hỏi trắc nghiệm về chủ đề "${topic}" cho học viên cấp độ ${level}.

Yêu cầu:
- Mỗi câu có 4 lựa chọn (A, B, C, D)
- Đánh dấu đáp án đúng
- Giải thích ngắn tại sao đáp án đó đúng (tiếng Việt)
- Độ khó phù hợp cấp ${level}

Trả lời dạng JSON:
{
  "questions": [
    {
      "question": "câu hỏi",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 0,
      "explanation": "giải thích tiếng Việt"
    }
  ]
}
  `.trim(),
}
