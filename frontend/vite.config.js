import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function resolveFromFrontend(relativeOrAbsolutePath) {
  if (!relativeOrAbsolutePath) return ''
  return path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.resolve(process.cwd(), relativeOrAbsolutePath)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const httpsEnabled = env.DEV_HTTPS === 'true'
  const keyPath = resolveFromFrontend(env.DEV_HTTPS_KEY_FILE)
  const certPath = resolveFromFrontend(env.DEV_HTTPS_CERT_FILE)
  const hasHttpsFiles = keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      https:
        httpsEnabled && hasHttpsFiles
          ? {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath)
            }
          : false
    }
  }
})
