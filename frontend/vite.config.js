import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',           // modern browsers
    sourcemap: false,           // disable source maps for smaller bundles
    chunkSizeWarningLimit: 1000, // increase warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separate vendor (node_modules) code from app code
            return 'vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src', // optional: easier imports
    },
  },
});
