import { defineConfig } from 'vitest/config';

// Unit tests run in Node, without the Cloudflare and TanStack Start plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});
