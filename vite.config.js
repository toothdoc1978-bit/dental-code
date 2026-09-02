import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// Build identity shown in the app header so testers can tell which build is
// live. Vercel injects VERCEL_GIT_COMMIT_SHA on git-linked builds.
const buildSha = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'local'

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_SHA__: JSON.stringify(buildSha)
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
