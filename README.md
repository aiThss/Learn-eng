# EnglishUp - Ứng dụng học tiếng Anh thông minh

Ứng dụng PWA + Android học tiếng Anh từ A0 → B1 (IELTS 4.0-5.0 / TOEIC 550-650) với AI.

## 🚀 Demo nhanh

```bash
npm install
cp .env.example .env.local  # Điền API key của bạn
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173) 

## ✨ Tính năng chính

- 🧠 **AI Gia sư** - Hỏi đáp, giải thích ngữ pháp, chấm bài bằng Gemini AI
- 🃏 **SRS Flashcard** - Spaced Repetition System (thuật toán SM-2)
- 🎤 **Speaking AI** - Luyện nói với AI feedback tức thì
- ✍️ **Writing AI** - Nộp bài viết, AI chấm điểm và góp ý
- 📊 **Dashboard** - Theo dõi tiến độ, streak, điểm IELTS ước tính
- 🗺️ **Lộ trình** - A0 → B1 theo tuần, có bài tập đủ 4 kỹ năng
- 📱 **PWA + Android** - Cài được trên điện thoại, offline-first

## 🏗️ Stack kỹ thuật

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Routing | React Router v6 |
| Database | Dexie.js (IndexedDB) |
| AI | Google Gemini API |
| PWA | vite-plugin-pwa |
| Mobile | Capacitor v6 |

## 🔧 Cài đặt

### 1. Clone và cài dependencies

```bash
git clone https://github.com/aiThss/Learn-eng.git
cd Learn-eng
npm install
```

### 2. Cấu hình API key

```bash
cp .env.example .env.local
```

Mở `.env.local` và điền:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Lấy Gemini API key miễn phí:** [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 3. Chạy development

```bash
npm run dev
```

## 📱 Build Android APK

```bash
# 1. Build web
npm run build

# 2. Đồng bộ với Capacitor
npx cap add android
npx cap sync android

# 3. Mở Android Studio
npx cap open android
```

Trong Android Studio: **Build → Generate Signed Bundle / APK**

## 🏠 Cấu trúc thư mục

```
src/
├── pages/           # 14 trang chính
├── components/      # UI components
│   └── layout/      # AppShell, TopBar, BottomNav
├── services/        # Business logic
│   ├── ai/          # Gemini AI service
│   ├── db/          # Dexie.js database
│   ├── srs/         # SM-2 algorithm
│   └── speech/      # TTS + STT
├── store/           # Zustand state management
├── types/           # TypeScript types
└── lib/             # Utilities
```

## 📚 Lộ trình học

| Phase | Level | Thời gian | Mục tiêu |
|-------|-------|-----------|----------|
| 0 | A0 | 2 tuần | Làm quen cơ bản |
| 1 | A1 | 6 tuần | 500 từ, ngữ pháp cơ bản |
| 2 | A2 | 8 tuần | 1500 từ, giao tiếp hàng ngày |
| 3 | B1 | 12 tuần | 3500 từ, IELTS 4.0-5.0 |

## 🤝 Đóng góp

PR và issues hoan nghênh!

## 📄 License

MIT
