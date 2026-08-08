# Triển khai EnglishUp PWA trên Dokploy

Repository đã có sẵn `Dockerfile`, cấu hình Nginx và `.dockerignore`. Dokploy sẽ build Vite, sau đó chỉ phục vụ thư mục `dist` qua Nginx tại port `80`.

## 1. Chuẩn bị domain và DNS

Khuyến nghị dùng subdomain riêng cho ứng dụng:

| Mục đích | Bản ghi DNS | Giá trị |
| --- | --- | --- |
| PWA chính | `A` — `app` | IPv4 của VPS cài Dokploy |
| Tên thay thế (tuỳ chọn) | `CNAME` — `www` | `app.ten-mien-cua-ban.com` |
| AI backend sau này (tuỳ chọn) | `A` — `api` | IPv4 của VPS cài Dokploy |

Ví dụ, với domain `example.com`, PWA sẽ chạy tại `app.example.com`. Nếu chỉ có một website, có thể dùng bản ghi `A` cho `@` và host `example.com` thay cho `app.example.com`.

Mở TCP `80` và `443` trên firewall VPS. Nếu dùng Cloudflare, để bản ghi ở chế độ **DNS only** trong lần cấp chứng chỉ đầu tiên.

## 2. Tạo Application trong Dokploy

1. Tạo **Project** và **Environment** mới, rồi chọn **Create Application**.
2. Chọn GitHub/Git source, kết nối repo `aiThss/Learn-eng` và branch `main`.
3. Trong **Build Type**, chọn **Dockerfile**.
4. Điền các trường sau:

   | Trường | Giá trị |
   | --- | --- |
   | Dockerfile Path | `Dockerfile` |
   | Docker Context Path | `.` |
   | Docker Build Stage | Để trống |

5. Không khai báo port public trong mục Advanced. Traefik của Dokploy sẽ chuyển tiếp nội bộ tới Nginx.
6. Nhấn **Deploy** và xem log cho đến khi container có trạng thái running/healthy.

Không thêm `VITE_GEMINI_API_KEY` vào Dokploy: mọi biến `VITE_*` được nhúng vào JavaScript PWA và có thể bị lấy bởi người dùng. Khi bật AI production, triển khai API proxy ở `api.example.com`, giữ Gemini key trong secret của backend.

## 3. Gắn domain và HTTPS

Trong Application vừa tạo, mở **Domains** → **Add Domain**:

| Trường | Giá trị |
| --- | --- |
| Host | `app.example.com` |
| Path | `/` |
| Container Port | `80` |
| HTTPS | Bật |
| Certificate | `Let's Encrypt` |

Lưu cấu hình. Đợi DNS phổ biến và Let's Encrypt cấp chứng chỉ, sau đó mở `https://app.example.com`.

Nếu dùng `www`, thêm host `www.example.com` trong Domains và đặt redirect `www` sang host chính trong mục Advanced → Redirects.

## 4. Kiểm tra sau phát hành

1. Mở một route con, ví dụ trang Dashboard, rồi refresh: trang phải không bị `404`.
2. Chrome/Edge → menu → **Install app** để cài PWA.
3. Mở app một lần, tắt mạng, tải lại để xác nhận offline cache.
4. Kiểm tra `https://app.example.com/manifest.webmanifest` và `https://app.example.com/sw.js` trả về `200`.

## 5. Phát hành bản web mới

Mọi thay đổi web được deploy theo chuỗi: commit → push `main` → Dokploy Deploy (hoặc bật Auto Deploy nếu bạn đã cấu hình webhook). PWA trong máy người học sẽ nhận bản mới nhờ service worker `autoUpdate`.
