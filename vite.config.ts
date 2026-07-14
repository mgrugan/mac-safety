import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the production build works on GitHub Pages' project
  // subpath (https://<user>.github.io/mac-safety/) without hardcoding it.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
