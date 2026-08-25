import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // loadEnv 把 .env 注入，修复原 process.env.VITE_API_TARGET 永远取不到的问题
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/coupon/',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/coupon_api': {
          target: env.VITE_API_TARGET || 'http://192.168.33.100:8088',
          changeOrigin: true,
        },
      },
    },
  }
})
