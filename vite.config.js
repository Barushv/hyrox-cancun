import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BASE = '/hyrox-cancun/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      filename: 'sw.js',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        navigateFallback: `${BASE}index.html`,
        runtimeCaching: [
          {
            // Fuentes de Google: se guardan para usar la app sin internet
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Hyrox Cancún 2027',
        short_name: 'Hyrox CUN',
        description: 'Plan integrado de entrenamiento, nutrición y día a día para Hyrox Cancún 2027.',
        lang: 'es',
        theme_color: '#00857F',
        background_color: '#EEF4F3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
