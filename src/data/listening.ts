import type { ListeningExercise } from '@/types'

/**
 * Offline listening scripts. `ssml` is kept alongside every recording so the
 * same material can be exported to Google Cloud TTS later without changing
 * the learner-facing text. The app itself uses native Web Speech only.
 */
export const LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: 'l001',
    title: 'Chào hỏi cơ bản',
    audioUrl: '/audio/greeting-dialogue.mp3',
    transcript: `A: Hello! How are you today?
B: Hi! I'm fine, thank you. And you?
A: I'm good too, thanks! My name is Anna. What's your name?
B: My name is Tom. Nice to meet you, Anna!
A: Nice to meet you too, Tom! Where are you from?
B: I'm from Vietnam. And you?
A: I'm from England. Do you speak English well?
B: A little. I'm learning English now.
A: That's great! Keep practising!`,
    ssml: `<speak>
  <prosody rate="slow"><emphasis level="moderate">Hello!</emphasis><break time="450ms"/> How are you today?</prosody>
  <break time="700ms"/>
  <prosody rate="slow">Hi! I'm fine, thank you.<break time="350ms"/> And you?</prosody>
  <break time="700ms"/>
  My name is Anna. What's your name?<break time="700ms"/>
  My name is Tom. <emphasis level="moderate">Nice to meet you</emphasis>, Anna!<break time="700ms"/>
  Nice to meet you too, Tom! Where are you from?<break time="700ms"/>
  I'm from <emphasis level="moderate">Vietnam</emphasis>. And you?<break time="700ms"/>
  I'm from England. Do you speak English well?<break time="700ms"/>
  A little. I'm learning English now.<break time="700ms"/>
  That's great! Keep practising!
</speak>`,
    shadowingCues: ['Hello! How are you today?', "I'm fine, thank you. And you?", 'Nice to meet you.', "I'm from Vietnam.", "I'm learning English now."],
    objectives: ['Nhận diện lời chào và tự giới thiệu', 'Nghe tên, quốc gia và hoạt động hiện tại'],
    questions: [
      { id: 'q001', question: "What is the woman's name?", options: ['Tom', 'Anna', 'Mary', 'Lisa'], correctAnswer: 1, explanation: 'She said "My name is Anna".' },
      { id: 'q002', question: 'Where is Tom from?', options: ['England', 'America', 'Vietnam', 'Japan'], correctAnswer: 2, explanation: 'Tom said "I\'m from Vietnam".' },
      { id: 'q003', question: 'What is Tom doing now?', options: ['Working', 'Sleeping', 'Learning English', 'Watching TV'], correctAnswer: 2, explanation: 'Tom said "I\'m learning English now".' },
    ],
    difficulty: 'PHASE_0',
    duration: 30,
    topic: 'Greeting',
  },
  {
    id: 'l002',
    title: 'Gọi đồ ăn tại nhà hàng',
    audioUrl: '/audio/restaurant-dialogue.mp3',
    transcript: `Waiter: Good evening! Welcome to Green Garden Restaurant.
Customer: Good evening! A table for two, please.
Waiter: Of course! Please follow me. Here is your menu.
Customer: Thank you. Can I have the chicken soup, please?
Waiter: Certainly! And what would you like to drink?
Customer: A glass of water, please.
Waiter: Anything else?
Customer: No, that's all. How much is it?
Waiter: The chicken soup is ten dollars. The water is free.
Customer: Great, thank you very much!
Waiter: You're welcome. Enjoy your meal!`,
    ssml: `<speak>
  <prosody rate="slow">Good evening! Welcome to Green Garden Restaurant.</prosody><break time="700ms"/>
  A table for two, please.<break time="700ms"/>
  Of course! Please follow me. Here is your menu.<break time="700ms"/>
  Can I have the <emphasis level="moderate">chicken soup</emphasis>, please?<break time="700ms"/>
  Certainly! And what would you like to drink?<break time="700ms"/>
  A glass of water, please.<break time="700ms"/>
  Anything else?<break time="700ms"/>
  No, that's all. How much is it?<break time="700ms"/>
  The chicken soup is <prosody rate="slow">ten dollars</prosody>. The water is free.<break time="700ms"/>
  Great, thank you very much!<break time="500ms"/> You're welcome. Enjoy your meal!
</speak>`,
    shadowingCues: ['A table for two, please.', 'Can I have the chicken soup, please?', 'A glass of water, please.', 'How much is it?', 'Enjoy your meal!'],
    objectives: ['Gọi món lịch sự', 'Nghe món ăn, đồ uống và giá tiền'],
    questions: [
      { id: 'q004', question: 'Where does this conversation take place?', options: ['A hotel', 'A restaurant', 'A school', 'A market'], correctAnswer: 1, explanation: 'The waiter says "Welcome to Green Garden Restaurant".' },
      { id: 'q005', question: 'What did the customer order to eat?', options: ['Pizza', 'Chicken soup', 'Steak', 'Salad'], correctAnswer: 1, explanation: 'The customer asks for chicken soup.' },
      { id: 'q006', question: 'How much does the chicken soup cost?', options: ['$5', '$8', '$10', '$15'], correctAnswer: 2, explanation: 'The waiter says it is ten dollars.' },
    ],
    difficulty: 'PHASE_0',
    duration: 36,
    topic: 'Restaurant',
  },
]

export const DAILY_STUDY_LISTENING: ListeningExercise = {
  id: 'l003',
  title: 'My Daily Study Routine',
  audioUrl: '/audio/daily-study-routine.mp3',
  transcript: `Hi! My name is Mia. I study English for two hours every day. In the morning, I review ten new words and read them aloud. After dinner, I listen to a short English dialogue and repeat each sentence. Before bed, I write three simple sentences about my day. On Sunday, I review the words again and practise speaking with my friend. This routine helps me remember English and feel more confident.`,
  ssml: `<speak>
  <prosody rate="slow">Hi! My name is Mia.</prosody><break time="600ms"/>
  I study English for <emphasis level="moderate">two hours</emphasis> every day.<break time="600ms"/>
  In the morning, I review ten new words and read them aloud.<break time="600ms"/>
  After dinner, I listen to a short English dialogue and repeat each sentence.<break time="600ms"/>
  Before bed, I write three simple sentences about my day.<break time="600ms"/>
  On Sunday, I review the words again and practise speaking with my friend.<break time="600ms"/>
  This routine helps me remember English and feel more confident.
</speak>`,
  shadowingCues: ['I study English for two hours every day.', 'I review ten new words.', 'I repeat each sentence.', 'I write three simple sentences.', 'I feel more confident.'],
  objectives: ['Nghe thói quen học tập hằng ngày', 'Nhận diện thời lượng và hoạt động theo thời điểm'],
  questions: [
    { id: 'q007', question: 'What is the main topic of the audio?', options: ['Travel plans', 'Work schedule', 'Study habits', 'Weekend activities'], correctAnswer: 2, explanation: 'Mia describes her daily English study routine.' },
    { id: 'q008', question: 'How long does Mia study English each day?', options: ['One hour', 'Two hours', 'Three hours', 'Thirty minutes'], correctAnswer: 1, explanation: 'She says she studies for two hours every day.' },
    { id: 'q009', question: 'What does Mia do before bed?', options: ['Watches a film', 'Calls her teacher', 'Writes three sentences', 'Learns ten new words'], correctAnswer: 2, explanation: 'Before bed, she writes three simple sentences about her day.' },
  ],
  difficulty: 'PHASE_1',
  duration: 31,
  topic: 'Daily routine',
}
