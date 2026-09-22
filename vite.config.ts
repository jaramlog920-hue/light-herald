/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/*', 'apple-touch-icon.png', 'favicon.ico', 'favicon-32.png', 'favicon-16.png', 'favicon-48.png'],
      manifest: {
        name: '복음의 전령: 땅 끝까지',
        short_name: '복음의 전령',
        description: '신약을 읽을수록 어두운 고대 지도에 빛이 번지는 통독 게임',
        lang: 'ko',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0f1a',
        theme_color: '#0b0f1a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // 본문 JSON이 번들에 포함되므로 JS까지 캐시하면 오프라인 읽기가 된다
        globPatterns: ['**/*.{js,css,html,webp,png,svg}'],
        // 책 대표 그림 27장(3.5MB)은 처음 열 때 받지 않고, 한 번 본 뒤 캐시한다
        globIgnores: ['**/assets/books/**'],
        runtimeCaching: [{ urlPattern: /\/assets\/books\/.*\.webp$/, handler: 'CacheFirst', options: { cacheName: 'book-pictures', expiration: { maxEntries: 40 } } }],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
})
