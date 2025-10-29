# Check OCR Web Application

Ứng dụng web để xử lý và kiểm tra OCR.

## Yêu cầu hệ thống

- Node.js (phiên bản 14.x trở lên)
- PNPM (có thể cài đặt thông qua npm install -g pnpm)

## Các bước cài đặt

1. Clone repository:
```bash
git clone https://github.com/theha11/check-ocr-web.git
cd check-ocr-web
```

2. Cài đặt dependencies:
```bash
pnpm install
```

3. Cài đặt dependencies cho server:
```bash
cd server
pnpm install
cd ..
```

## Chạy ứng dụng

1. Khởi động server:
```bash
cd server
pnpm start
```

2. Trong terminal mới, khởi động frontend:
```bash
# Từ thư mục gốc của project
pnpm dev
```

Frontend sẽ chạy tại `http://localhost:5173` và server sẽ chạy tại `http://localhost:3000`.

## Cấu trúc project

- `/src` - Mã nguồn frontend (React)
- `/server` - Mã nguồn backend (Node.js)
- `/public` - Tài nguyên tĩnh

## Môi trường phát triển

Project sử dụng:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite