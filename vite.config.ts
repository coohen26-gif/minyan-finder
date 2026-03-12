import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Minyan Finder',
        short_name: 'Minyan',
        description: 'Trouvez et organisez des Minyanim près de chez vous',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/minyan/',
        start_url: '/minyan/',
        icons: [
          {
            src: '/minyan/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/minyan/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  base: '/minyan/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
