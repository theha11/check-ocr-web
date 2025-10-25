import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const HOST = '6psll2-5173.csb.app' // <-- thay bằng host đang hiện trên Preview

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                        // lắng nghe 0.0.0.0
    allowedHosts: [HOST],              // Vite 5 hỗ trợ string[]
    hmr: { host: HOST, protocol: 'https', clientPort: 443 }
  }
})