# Check OCR Web Application

Ứng dụng web để xử lý và kiểm tra OCR.

## Yêu cầu hệ thống

### 1. Cài đặt Node.js
- Truy cập https://nodejs.org
- Tải và cài đặt Node.js phiên bản LTS (phiên bản 14.x trở lên)
- Kiểm tra cài đặt bằng lệnh:
  ```bash
  node --version
  npm --version
  ```

### 2. Cài đặt PNPM
Có nhiều cách để cài đặt PNPM:

#### Cách 1: Cài đặt thông qua npm (Windows, macOS, Linux)
```bash
npm install -g pnpm
```

#### Cách 2: Cài đặt thông qua PowerShell (Windows)
```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

#### Cách 3: Cài đặt thông qua curl (macOS, Linux)
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Kiểm tra cài đặt PNPM:
```bash
pnpm --version
```

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