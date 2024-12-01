import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Add custom logic to split other large modules
          // For example:
          // if (id.includes('some-large-module')) {
          //   return 'large-module';
          // }
        },
      }
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
});