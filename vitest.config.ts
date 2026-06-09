import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Tests boot the app; keep logging quiet via NODE_ENV=test.
    env: { NODE_ENV: 'test' },
  },
});
