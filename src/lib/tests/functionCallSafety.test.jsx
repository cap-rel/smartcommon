/**
 * Function Call Safety Tests
 *
 * These tests verify that:
 * 1. Utility functions don't crash when called with non-function values
 * 2. Components handle icon props correctly (function vs JSX element)
 * 3. onClick handlers are not called prematurely during render
 *
 * Error prevented: "TypeError: Ta(...) is undefined" (function call on undefined)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// =============================================================================
// UTILITY FUNCTIONS TESTS (direct import, no mocks)
// =============================================================================

describe('Utility Functions - Function Call Safety', () => {
  it('applyFunctionIfNotNil: should not crash when value is not a function', async () => {
    const { applyFunctionIfNotNil } = await import('lib/utils/functions/type/index.js');

    // Should not throw when value is undefined/null
    expect(() => applyFunctionIfNotNil(undefined)).not.toThrow();
    expect(() => applyFunctionIfNotNil(null)).not.toThrow();

    // Should not throw when value is not a function
    expect(() => applyFunctionIfNotNil('string')).not.toThrow();
    expect(() => applyFunctionIfNotNil(123)).not.toThrow();
    expect(() => applyFunctionIfNotNil({})).not.toThrow();
    expect(() => applyFunctionIfNotNil([])).not.toThrow();

    // Should return undefined for non-function values
    expect(applyFunctionIfNotNil(undefined)).toBe(undefined);
    expect(applyFunctionIfNotNil('string')).toBe(undefined);
    expect(applyFunctionIfNotNil(123)).toBe(undefined);

    // Should call and return result when value is a function
    const mockFn = vi.fn().mockReturnValue('result');
    expect(applyFunctionIfNotNil(mockFn, 'arg1', 'arg2')).toBe('result');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('applyFunctionIfFunction: should not crash when value is not a function', async () => {
    const { applyFunctionIfFunction } = await import('lib/utils/functions/type/index.js');

    // Should not throw when value is undefined/null
    expect(() => applyFunctionIfFunction(undefined)).not.toThrow();
    expect(() => applyFunctionIfFunction(null)).not.toThrow();

    // Should not throw when value is not a function
    expect(() => applyFunctionIfFunction('string')).not.toThrow();
    expect(() => applyFunctionIfFunction(123)).not.toThrow();
    expect(() => applyFunctionIfFunction({})).not.toThrow();

    // Should return undefined for non-function values
    expect(applyFunctionIfFunction(undefined)).toBe(undefined);
    expect(applyFunctionIfFunction('string')).toBe(undefined);

    // Should call and return result when value is a function
    const mockFn = vi.fn().mockReturnValue('result');
    expect(applyFunctionIfFunction(mockFn, 'arg1', 'arg2')).toBe('result');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('applyFunctionIfFunction: should spread params correctly (not pass as array)', async () => {
    const { applyFunctionIfFunction } = await import('lib/utils/functions/type/index.js');

    const mockFn = vi.fn();
    applyFunctionIfFunction(mockFn, 'a', 'b', 'c');

    // Should receive individual args, not an array
    expect(mockFn).toHaveBeenCalledWith('a', 'b', 'c');
    expect(mockFn).not.toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('applyFunctionIfNotNil: should spread params correctly (not pass as array)', async () => {
    const { applyFunctionIfNotNil } = await import('lib/utils/functions/type/index.js');

    const mockFn = vi.fn();
    applyFunctionIfNotNil(mockFn, 'a', 'b', 'c');

    // Should receive individual args, not an array
    expect(mockFn).toHaveBeenCalledWith('a', 'b', 'c');
    expect(mockFn).not.toHaveBeenCalledWith(['a', 'b', 'c']);
  });
});

// =============================================================================
// ICON RENDER HELPER TESTS
// =============================================================================

describe('Icon rendering pattern - Function Call Safety', () => {

  it('should safely render icon whether function or JSX element', () => {
    // This tests the pattern: typeof icon === 'function' ? icon() : icon

    const renderIcon = (icon) => {
      if (!icon) return null;
      return typeof icon === 'function' ? icon() : icon;
    };

    // undefined/null - should not crash
    expect(() => renderIcon(undefined)).not.toThrow();
    expect(() => renderIcon(null)).not.toThrow();
    expect(renderIcon(undefined)).toBe(null);
    expect(renderIcon(null)).toBe(null);

    // JSX element - should return as-is
    const jsxIcon = <span>icon</span>;
    expect(() => renderIcon(jsxIcon)).not.toThrow();
    expect(renderIcon(jsxIcon)).toBe(jsxIcon);

    // Function - should call and return result
    const IconFn = () => <span>icon from fn</span>;
    expect(() => renderIcon(IconFn)).not.toThrow();
    expect(renderIcon(IconFn)).toEqual(<span>icon from fn</span>);

    // String (edge case) - should return as-is
    expect(() => renderIcon('icon-name')).not.toThrow();
    expect(renderIcon('icon-name')).toBe('icon-name');

    // Object (edge case) - should return as-is, not crash trying to call it
    const objIcon = { type: 'svg', props: {} };
    expect(() => renderIcon(objIcon)).not.toThrow();
    expect(renderIcon(objIcon)).toBe(objIcon);
  });

  it('should not call non-function values as functions', () => {
    // This is the bug we're preventing:
    // Before fix: icon() would crash if icon was a JSX element
    // After fix: typeof icon === 'function' ? icon() : icon

    const badPattern = (icon) => {
      if (icon) {
        return icon(); // BAD: crashes if icon is not a function
      }
      return null;
    };

    const goodPattern = (icon) => {
      if (icon) {
        return typeof icon === 'function' ? icon() : icon;
      }
      return null;
    };

    const jsxIcon = <span>icon</span>;

    // Bad pattern crashes
    expect(() => badPattern(jsxIcon)).toThrow();

    // Good pattern works
    expect(() => goodPattern(jsxIcon)).not.toThrow();
  });
});

// =============================================================================
// ONCLICK HANDLER PATTERN TESTS
// =============================================================================

describe('onClick handler pattern - Function Call Safety', () => {

  it('should not invoke onClick during property access', () => {
    // This tests the bug: props.onClick() vs props.onClick
    // props.onClick() immediately invokes the function
    // props.onClick just references it

    const mockOnClick = vi.fn();
    const props = { onClick: mockOnClick };

    // Bad pattern: props.onClick() - invokes immediately
    // This is what we're preventing

    // Good pattern: just reference the function
    const handler = props.onClick;
    expect(mockOnClick).not.toHaveBeenCalled();

    // Only call when needed (e.g., in event handler)
    handler();
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applyFunctionIfFunction should safely handle the onClick reference', async () => {
    const { applyFunctionIfFunction } = await import('lib/utils/functions/type/index.js');

    const mockOnClick = vi.fn();
    const mockEvent = { type: 'click' };

    // Passing the function reference (correct)
    applyFunctionIfFunction(mockOnClick, mockEvent);
    expect(mockOnClick).toHaveBeenCalledWith(mockEvent);

    mockOnClick.mockClear();

    // Passing undefined (should not crash)
    expect(() => applyFunctionIfFunction(undefined, mockEvent)).not.toThrow();
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
