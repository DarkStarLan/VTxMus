import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// Electron 专用配置：使用相对路径
export default defineConfig({
  base: './', // Electron 需要相对路径
  define: {
    'import.meta.env.VITE_ELECTRON': true
  },
  plugins: [
    vue(),
    vueJsx(),
    // 不包含 devtools，生产环境不需要
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 确保资源使用相对路径
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

