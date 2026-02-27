import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: false, // Don't empty the dist folder, as the main build runs first
    rollupOptions: {
      input: resolve(__dirname, 'src/content.js'),
      output: {
        format: 'iife', // Compile as IIFE to avoid ES module imports in content script
        entryFileNames: 'content.js',
        dir: 'dist' // Output directly to dist
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production') // Important for Vue in IIFE mode
  }
})
