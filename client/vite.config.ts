import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure service worker and manifest are included in build
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  // Development server configuration
  server: {
    headers: {
      // Required for Service Worker in development
      'Service-Worker-Allowed': '/',
    },
  },
})
