# 🚀 EnglishUp - Học Tiếng Anh Thông Minh từ A0 đến B1

<p justify="center">
  <a href="https://raw.githubusercontent.com/aiThss/Learn-eng/main/releases/EnglishUp-v0.0.1.apk">
    <img src="https://img.shields.io/badge/📥%20Download-Android%20APK%20v0.0.1-brightgreen.svg?style=for-the-badge&logo=android&logoColor=white" alt="Download APK" />
  </a>
  <a href="https://github.com/aiThss/Learn-eng/tree/main/releases">
    <img src="https://img.shields.io/badge/Version-v0.0.1-blue.svg?style=for-the-badge" alt="Version v0.0.1" />
  </a>
  <img src="https://img.shields.io/badge/Platform-PWA%20%7C%20Android-orange.svg?style=for-the-badge" alt="Platform PWA Android" />
  <img src="https://img.shields.io/badge/AI-Gemini%203.1%20Flash--Lite-purple.svg?style=for-the-badge" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License MIT" />
</p>

---

## 📲 TẢI VỀ ỨNG DỤNG ANDROID (DIRECT DOWNLOAD)

Nhấn vào nút bên dưới để tải trực tiếp file APK về điện thoại Android của bạn:

👉 [**📥 Tải EnglishUp v0.0.1 APK**](https://raw.githubusercontent.com/aiThss/Learn-eng/main/releases/EnglishUp-v0.0.1.apk)

Hoặc mở trang **Tải Android** trong ứng dụng để quét mã QR. Mã QR chỉ trỏ đến repository GitHub chính thức; luôn đối chiếu SHA-256 trong tệp `.sha256` trước khi cài đặt.

SHA-256 của `EnglishUp-v0.0.1.apk`: `47DB25C98CC557A768C60716EF2BBFBF374B094F627F3445406C737E288F8E30`

### 🛠️ Hướng dẫn cài đặt trên Android:
1. Nhấn đường link trên để tải file `EnglishUp-v0.0.1.apk`.
2. Mở file vừa tải về và chọn **Cài đặt** (Install).
3. Nếu thiết bị thông báo "Ứng dụng từ nguồn không xác định", hãy chọn **Cho phép từ nguồn này** (Allow from this source).
4. Mở app **EnglishUp** và bắt đầu trải nghiệm!

> EnglishUp v0.0.1 bản mới dùng cùng certificate với bản v0.0.1 trước đó, nên có thể cài đè để cập nhật và giữ dữ liệu học. Các bản dùng certificate cũ hơn cần được gỡ trước khi cài.

---

## ✨ Tính năng nổi bật

- 🧠 **Gia sư AI Gemini**: Giải thích ngữ pháp tiếng Việt tự nhiên, tư vấn bài viết, phân tích câu nói.
- 🎤 **Luyện nói AI (Speaking)**: Thu âm giọng nói qua Web Speech API + AI nhận xét phát âm & độ tự nhiên.
- 🃏 **Ghi nhớ Spaced Repetition (SRS)**: Thuật toán SuperMemo SM-2 giúp học từ vựng hiệu quả gấp 3 lần.
- ✍️ **Luyện viết (Writing)**: Chấm điểm bài viết theo tiêu chuẩn 4 tiêu chí IELTS/TOEIC.
- 🗺️ **Lộ trình 28 tuần (A0 → B1)**: Chia theo 4 Phase khoa học từ người mới bắt đầu / mất gốc.
- 📱 **PWA + Offline First**: Hoạt động mượt mà ngay cả khi không có kết nối Internet.
- 🔊 **Nghe offline**: MP3, transcript/subtitle, shadowing và SSML có sẵn cho từng bài; phát âm dùng Free Dictionary API khi có mạng và Web Speech API của thiết bị khi cần.
- 🧩 **Đánh giá theo lộ trình**: Placement test 20 câu (từ vựng, ngữ pháp, đọc hiểu) và quiz cuối bài tích hợp nghe/từ vựng/ngữ pháp, cần đạt 70% để hoàn tất.
- 👤 **Đổi người học**: Đăng xuất nhanh trong Cài đặt; Google OAuth được bật bằng biến môi trường, không đưa secret vào APK.

---

## 🏗️ Stack Công Nghệ

- **Frontend**: React 18 + TypeScript (Strict mode) + Vite 5
- **Giao diện**: Tailwind CSS v4 + Glassmorphism Dark Mode
- **State & Storage**: Zustand + Dexie.js (IndexedDB)
- **AI Core**: Gemini 3.1 Flash-Lite cho chat/feedback văn bản; phát âm dùng Web Speech API của thiết bị, không dùng Gemini TTS.
- **Mobile Native**: Capacitor v6 (Android Engine)

---

## 🛠️ Cài đặt cho Developer

```bash
# Clone repository
git clone https://github.com/aiThss/Learn-eng.git
cd Learn-eng

# Cài đặt dependencies
npm install

# Cấu hình Gemini API Key
cp .env.example .env.local

# Chạy bản Dev Web
npm run dev

# Build bản tĩnh Web + PWA
npm run build
```

### Dev Local và Google OAuth

`npm run dev` mở bản thử trong LAN tại `http://192.168.1.163:5173`. Khi chạy Vite, nút ghim **Dev Local** xuất hiện ở góc dưới và trong Cài đặt để mở nhanh từ điện thoại cùng Wi-Fi.

Để bật nút đăng nhập Google, tạo OAuth Client ID cho đúng origin thử nghiệm (ví dụ `http://localhost:5173`) trong Google Cloud Console, rồi thêm vào `.env.local`:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

Access token chỉ được dùng tức thời để đọc hồ sơ Google và không lưu trong trình duyệt hoặc APK. Muốn đồng bộ tiến độ đa thiết bị, cần thêm backend để xác thực và lưu dữ liệu người học.

---

## 📄 License
Phát hành theo giấy phép [MIT](LICENSE).
