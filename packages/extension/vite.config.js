import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
// Note: manifest.json, background.js, and content.js live in public/ and are
// copied to dist/ automatically by Vite during build.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        receiver: resolve(__dirname, 'receiver/index.html'),
      },
    },
  },
});
