import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',
  envDir: '..',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true, chunkSizeWarningLimit: 1200 },
  worker: { format: 'es' },
  server: {
    port: 5173,
    allowedHosts: ['.trycloudflare.com'],
    proxy: { '/api': 'http://localhost:3000' },
  },
});
