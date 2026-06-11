import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'mock-scss-modules',
      transform(_code, id) {
        if (id.endsWith('.module.scss')) {
          return { code: 'export default new Proxy({}, { get: (_, k) => String(k) })' };
        }
      },
    },
  ],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        functions: 85,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
