import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      keep_fnames: true,
      mangle: false
    },

    polyfillModulePreload: false,
    rollupOptions: {
      input: {
        public: resolve(__dirname, 'public.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    },
    sourcemap: false // set to true for sourcemap support.
  },
})