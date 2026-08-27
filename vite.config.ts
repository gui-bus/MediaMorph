import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {

        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'sharp',
                'fluent-ffmpeg',
                '@ffmpeg-installer/ffmpeg',
                '@ffprobe-installer/ffprobe'
              ],
            },
          },
        },
      },
      preload: {

        input: path.join(__dirname, 'electron/preload.ts'),
      },

      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
