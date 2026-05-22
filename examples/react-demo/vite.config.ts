import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@rohan0420/fiberscope-core': fileURLToPath(
        new URL('../../packages/core/src/index.ts', import.meta.url)
      ),
      '@rohan0420/fiberscope-overlay': fileURLToPath(
        new URL('../../packages/overlay/src/index.ts', import.meta.url)
      ),
      '@rohan0420/fiberscope-react': fileURLToPath(
        new URL('../../packages/react/src/index.ts', import.meta.url)
      )
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  optimizeDeps: {
    include: [
      '@rohan0420/fiberscope-core',
      '@rohan0420/fiberscope-overlay',
      '@rohan0420/fiberscope-react'
    ]
  }
});
