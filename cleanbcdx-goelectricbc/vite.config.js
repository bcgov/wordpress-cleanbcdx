import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [ vue() ],
  resolve: {
      alias: {
        '@': fileURLToPath(new URL('blocks/vue-blocks/src', import.meta.url))
      }
    },
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
        admin: resolve(__dirname, 'admin.html'),
        vuePosts: resolve(__dirname,'blocks/vue-blocks/vue.html')
      }
    },
    sourcemap: false // set to true for sourcemap support.
  },
})