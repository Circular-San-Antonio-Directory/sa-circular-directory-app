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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
