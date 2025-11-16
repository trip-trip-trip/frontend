// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    // 2. VitePWA 플러그인 추가
    VitePWA({
      registerType: 'autoUpdate',
      

      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      manifest: {
        name: 'TripShot', // 앱 이름
        short_name: 'TripShot', // 홈 화면에 표시될 짧은 이름
        description: '우리의 여행 기록 앱',
        theme_color: '#ffffff', // 앱 테마 색상
        
        // 5. 앱 아이콘 (필수!)
        // 'public' 폴더에 192x192, 512x512 픽셀 아이콘 이미지를 넣어야 합니다.
        // (예: public/icons/icon-192x192.png)
        icons: [
          {
            src: '/icons/tripshot_logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/tripshot_logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
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