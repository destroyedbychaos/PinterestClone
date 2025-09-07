import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5228',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:5228',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
