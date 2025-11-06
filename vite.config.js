import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: [
      // ngrok의 새 .dev 도메인을 허용
      '.ngrok-free.dev',
      
      // (혹시 모르니 예전 .app 도메인도 추가)
      '.ngrok-free.app' 
    ]
  }
  
})
