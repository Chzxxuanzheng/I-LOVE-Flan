import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': new URL('./src/assets', import.meta.url).pathname,
      '~': new URL('./src', import.meta.url).pathname
    }
  }
})
