import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// Cấu hình Vite cho EnglishUp PWA
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lumina-logo.png'],
      manifest: {
        name: 'EnglishUp - Học tiếng Anh',
        short_name: 'EnglishUp',
        description: 'Ứng dụng học tiếng Anh từ A0 đến B1 với AI',
        theme_color: '#f4f6f8',
        background_color: '#f4f6f8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'lumina-logo.png', sizes: '2048x2048', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    // Vite 8's dependency optimizer can otherwise bundle a separate React copy
    // for Zustand, causing an invalid-hook-call crash in the dev server.
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    // Keep Zustand as source modules so its React import resolves to the same
    // optimized React instance used by ReactDOM.
    exclude: ['zustand'],
  },
  server: {
    port: 5173,
    host: true,
  },
})
