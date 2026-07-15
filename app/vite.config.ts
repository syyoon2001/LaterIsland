import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'assets/*'],
      manifest: {
        name: 'LaterIsland',
        short_name: 'LaterIsland',
        description: '나중에 볼 콘텐츠를 저장하고 AI로 정리하는 아카이빙 앱',
        theme_color: '#E6F1E3',
        background_color: '#E6F1E3',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        share_target: {
          action: '/share-target',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        }
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://firestore.googleapis.com',
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://res.cloudinary.com',
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          }
        ],
      }
    })
  ],
});
