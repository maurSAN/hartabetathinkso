import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && (await import("lovable-tagger")).componentTagger(),
  ].filter(Boolean),
  base: '/hartabetathinkso/', // Pentru GitHub Pages
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: "::",
    port: 8080,
  }
}))
