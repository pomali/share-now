import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    // quietjs-bundle assigns to this undeclared identifier; rewrite to a real global property.
    memoryInitializerPrefixURL: 'globalThis.__quietMemoryInitializerPrefixURL',
  },
})
