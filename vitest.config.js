import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/lib/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/components/**/*.jsx', 'src/lib/hooks/**/*.jsx'],
    },
  },
  resolve: {
    alias: {
      lib: path.resolve(__dirname, './src/lib'),
    },
  },
});
