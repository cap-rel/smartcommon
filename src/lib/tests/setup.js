import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Custom matcher to check if a component renders without throwing
expect.extend({
  toRenderSafely(received) {
    try {
      received();
      return {
        pass: true,
        message: () => 'Component rendered without errors',
      };
    } catch (error) {
      return {
        pass: false,
        message: () => `Component threw an error: ${error.message}`,
      };
    }
  },
});
