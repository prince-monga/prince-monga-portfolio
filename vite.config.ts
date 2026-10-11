import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { validateOrigin } from './src/lib/validateOrigin'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build' && mode === 'production') {
    for (const name of ['VITE_API_BASE_URL', 'VITE_SITE_URL'] as const) {
      const value = env[name]?.trim().replace(/\/+$/, '')
      if (!value) {
        throw new Error(`${name} must be set to the actual HTTPS origin for production builds`)
      }
      validateOrigin(value, name, false)
    }
  }

  return {
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
  }
})
