import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Gains — Workout Journal',
        short_name: 'Gains',
        description: 'Your notebook. Your progress.',
        theme_color: '#FAF6EF',
        background_color: '#FAF6EF',
        display: 'standalone',
        start_url: '/',
        // TODO(Phase 10 — PWA Polish): replace with real 192/512 PNG app icons
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})
