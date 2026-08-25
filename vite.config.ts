import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/coupon/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/coupon_api': {
        target: process.env.VITE_API_TARGET || 'http://192.168.33.100:8088',
        changeOrigin: true,
      },
    },
  },
})
