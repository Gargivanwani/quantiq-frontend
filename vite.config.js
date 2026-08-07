import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons.svg'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'QuantIQ Study Platform',
        short_name: 'QuantIQ',
        description: 'Personal quantitative finance study platform. Curriculum, formulas, flashcards, problems, resources, notes, and AI Tutor.',
        theme_color: '#0A0F1E',
        background_color: '#0A0F1E',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,ttf}']
      }
    })
  ],
  optimizeDeps: {
    include: ['react-is', 'recharts', 'katex', 'zustand'],
  },
  resolve: {
    alias: {
      'react-is': 'react-is',
    },
  },
})
