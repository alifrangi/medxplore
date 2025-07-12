import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    // Bundle size analysis in production
    process.env.ANALYZE && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  
  base: '/',
  
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Optimize build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'animation': ['framer-motion', 'canvas-confetti'],
        },
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  // Server configuration
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: true,
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
  },
  
  // Optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  
  // Environment variable prefix
  envPrefix: 'VITE_',
})