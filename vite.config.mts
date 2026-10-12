import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import neutralinoConfig from './neutralino.config.json'

const devUrl = new URL(neutralinoConfig.cli.frontendLibrary.devUrl)

/**
 * Renderer build for the Neutralinojs app.
 * Output goes to `www/` — web assets always compile into the `dist/`
 * folder, next to the compiled binaries in `dist/bin/`. The compiled tree is
 * the Neutralinojs resource and document root.
 */
export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/src')
    }
  },
  build: {
    outDir: resolve(__dirname, 'www'),
    emptyOutDir: true,
    rollupOptions: {
      input: { index: resolve(__dirname, 'src/index.html') }
    }
  },
  server: {
    port: Number.parseInt(devUrl.port, 10),
    open: false
  },
  plugins: [
    vue(),
    ui({
      router: false,
      icon: {
        clientBundle: {
          scan: true
        }
      }
    })
  ]
})
