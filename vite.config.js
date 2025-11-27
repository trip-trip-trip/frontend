// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA 플러그인 제거했음

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok-free.app'
    ],
    proxy: {
      '/api/kakao/start': {
        target: 'https://tripshot.duckdns.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/kakao\/start/, '/login/start/kakao')
      }
    }
  }
})
