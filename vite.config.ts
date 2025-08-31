import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/tweetsms': {
        target: 'https://tweetsms.ps',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tweetsms/, '')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
