import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['Vite-tests/**/*.test.js'], // Point to the Tests-vite directory.
  },
})
