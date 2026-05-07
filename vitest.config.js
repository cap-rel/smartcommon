import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/lib/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    // isolate:true (Vitest default) is required so vi.mock() factories don't
    // leak across files and previously-resolved modules aren't cached without
    // their mock. Setting isolate:false caused mocked provider hooks to be
    // shadowed by real imports loaded by an earlier test file.
    isolate: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/components/**/*.jsx', 'src/lib/hooks/**/*.jsx'],
    },
  },
  resolve: {
    alias: {
      lib: resolve(__dirname, './src/lib'),
    },
  },
});
