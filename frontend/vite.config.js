import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://nowicstdio.tech',
        changeOrigin: true
      },
      '/media': {
        target: 'https://nowicstdio.tech',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          ui: ['framer-motion', 'lucide-react'],
          analytics: ['react-ga4'],
          auth: ['@clerk/clerk-react'],
          lenis: ['@studio-freight/lenis'],
        }
      }
    }
  }
});
