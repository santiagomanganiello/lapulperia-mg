import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Solo tests unitarios (*.test.ts). Los E2E de Playwright usan otro runner.
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
