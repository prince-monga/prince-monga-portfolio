import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          admin: [
            './src/admin/pages/AdminDashboard',
            './src/admin/pages/ProjectsManager',
            './src/admin/pages/BlogManager',
            './src/admin/pages/JourneyManager',
            './src/admin/pages/JournalManager',
            './src/admin/pages/StreakPage',
            './src/admin/pages/InquiriesManager',
            './src/admin/pages/SettingsPage',
          ],
        },
      },
    },
  },
})
