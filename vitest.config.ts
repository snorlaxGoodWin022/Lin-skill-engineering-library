import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tools/__tests__/**/*.test.{js,mjs}'],
    environment: 'node',
  },
})
