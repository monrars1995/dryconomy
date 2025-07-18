import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.jsx', '.json']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          material: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  publicDir: 'public',
  server: {
    port: 9003,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    },
    proxy: {
      '/functions/v1': {
        target: 'https://okxieabjwqqrvpbkhpzz.supabase.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/functions\/v1/, '')
      }
    }
  }
})
