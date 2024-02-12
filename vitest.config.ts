import { defineConfig } from 'vitest/config'
// import react from "@vitejs/plugin-react";
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [],
  test: {
    include: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'e2e'],
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, './') }],
  },
})
