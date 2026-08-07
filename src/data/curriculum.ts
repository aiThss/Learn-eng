/**
 * Curriculum Data - Lộ trình học tiếng Anh A0 -> B1
 */
import type { PhaseInfo, WeekPlan } from '@/types'

export const PHASES_DATA: PhaseInfo[] = [
  {
    id: 'PHASE_0',
    name: 'Làm quen',
    level: 'A0',
    duration: '1-2 tuần',
    weeks: 2,
    description: 'Xây dựng nền tảng ngữ âm, bảng chữ cái, số đếm và câu chào hỏi căn bản.',
    targetVocabulary: 100,
    targetGrammar: ['Động từ To Be', 'Đại từ nhân xưng', 'Chào hỏi đơn giản'],
  },
  {
    id: 'PHASE_1',
    name: 'Cơ bản',
    level: 'A1',
    duration: '4-6 tuần',
    weeks: 6,
    description: 'Từ vựng sinh hoạt hàng ngày, thì Hiện tại đơn, câu giao tiếp mua sắm, giới thiệu bản thân.',
    targetVocabulary: 500,
    targetGrammar: ['Hiện tại đơn', 'Hiện tại tiếp diễn', 'Mạo từ a/an/the', 'Danh từ số nhiều'],
  },
  {
    id: 'PHASE_2',
    name: 'Trung cấp',
    level: 'A2',
    duration: '6-8 tuần',
    weeks: 8,
    description: 'Mở rộng chủ đề công việc, du lịch, thì Quá khứ đơn, Tương lai đơn, so sánh tính từ.',
    targetVocabulary: 1500,
    targetGrammar: ['Quá khứ đơn', 'Tương lai đơn', 'So sánh hơn & nhất', 'Động từ khuyết thiếu'],
  },
  {
    id: 'PHASE_3',
    name: 'Khá (Tiền B1)',
    level: 'B1',
    duration: '8-12 tuần',
    weeks: 12,
    description: 'Thì Hiện tại hoàn thành, câu điều kiện, bị động, kỹ năng nói & viết chuẩn format IELTS/TOEIC.',
    targetVocabulary: 3500,
    targetGrammar: ['Hiện tại hoàn thành', 'Câu bị động', 'Câu điều kiện 1 & 2', 'Mệnh đề quan hệ'],
  },
]

export const SAMPLE_WEEKS: Partial<WeekPlan>[] = [
  {
    week: 1,
    phase: 'PHASE_0',
    title: 'Tuần 1: Chào hỏi & Giới thiệu bản thân',
  },
  {
    week: 2,
    phase: 'PHASE_0',
    title: 'Tuần 2: Gia đình & Con số',
  },
  {
    week: 3,
    phase: 'PHASE_1',
    title: 'Tuần 3: Hoạt động hàng ngày',
  },
  {
    week: 4,
    phase: 'PHASE_1',
    title: 'Tuần 4: Sở thích & Thời gian rảnh',
  },
]
