import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Guard 红线：
//   - 不要配 base / publicPath / assetPrefix（router 自动加 /s/<appId>/ 前缀，
//     自己再配会变成双前缀 404）
//   - build outDir 保持默认 dist
export default defineConfig({
  plugins: [vue()],
  server: { host: '0.0.0.0', port: 5173 },
  build: { outDir: 'dist', emptyOutDir: true },
})
