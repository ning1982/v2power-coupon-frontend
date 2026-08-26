import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/coupon/',
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/coupon_api': {
          target: env.VITE_API_TARGET || 'http://192.168.33.100:8088',
          changeOrigin: true,
        },
      },
    },
  }
})
