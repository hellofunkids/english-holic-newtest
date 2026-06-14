import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA / service worker removed — app requires internet (OpenAI) so offline
// caching provides no benefit, and stale SW caches were blocking updates.
export default defineConfig({
  plugins: [react()],
})
