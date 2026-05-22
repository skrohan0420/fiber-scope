import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      fiberscope: fileURLToPath(new URL('../../packages/fiberscope/src/index.ts', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  optimizeDeps: {
    include: ['fiberscope']
  }
});
