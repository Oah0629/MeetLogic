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
        content: resolve(__dirname, 'src/content.js'),
        content_css: resolve(__dirname, 'src/content.css')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content') {
            return 'content.js';
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content.css' || assetInfo.name === 'content_css.css') {
            return 'content.css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        // Ensure static assets (like images) are in the root of dist if needed, or adjust
        // manualChunks: undefined,
        // chunkFileNames: 'assets/[name]-[hash].js',
        // entryFileNames: '[name].js', // Use this for all if no hash desired for all entries
      }
    }
  }
})
