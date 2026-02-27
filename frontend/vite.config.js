import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content_css: resolve(__dirname, 'src/content.css')
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content_css.css' || assetInfo.name === 'content.css') {
            return 'content.css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
})
