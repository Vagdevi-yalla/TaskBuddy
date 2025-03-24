import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
          'vendor-ui': ['@headlessui/react', '@heroicons/react', '@hello-pangea/dnd'],
          'vendor-utils': ['date-fns', 'clsx', '@tanstack/react-query']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
