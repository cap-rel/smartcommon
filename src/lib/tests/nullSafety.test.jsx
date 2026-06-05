/**
 * Null Safety Tests
 *
 * These tests verify that components don't crash when receiving
 * undefined, null, or empty values for props that might be arrays or objects.
 *
 * Error prevented: "TypeError: can't access property 'X', Y is undefined"
 */

import { describe, it, expect, vi } from 'vitest';
import { render, renderHook } from '@testing-library/react';

// Mock dependencies that components might need
vi.mock('lib/hooks', () => ({
  useVariantMerger: () => ({
    variantProps: {},
    mergeProps: (name, fn) => fn({}),
    mergeQuickProps: () => ({}),
  }),
  useField: () => ({
    currentValue: undefined,
    setValue: vi.fn(),
    isFormSubmitted: false,
    isFormSubmitting: false,
    filteredErrors: [],
  }),
  useStates: () => ({
    states: {},
    set: vi.fn(),
  }),
  useFile: () => ({
    resizeImage: vi.fn(),
  }),
  useUpload: () => ({
    uploadFile: vi.fn(),
    uploadFiles: vi.fn(),
    cancelUpload: vi.fn(),
  }),
}));

vi.mock('lib/components', () => ({
  Label: ({ children }) => <div>{children}</div>,
  Button: () => <button />,
  Input: () => <input />,
  Textarea: () => <textarea />,
  Popup: () => <div />,
  Tag: ({ children }) => <span>{children}</span>,
  Switch: () => <div />,
  Checkbox: () => <div />,
  Radio: () => <div />,
  Icon: () => <div />,
  Panel: ({ children }) => <div>{children}</div>,
}));

vi.mock('lib/utils', () => ({
  applyFunctionIfNotNil: vi.fn(),
  applyFunctionIfFunction: vi.fn(),
  locate: vi.fn(),
  splitFileExtension: () => ['filename', 'ext'],
  ISOFormat: () => '2024-01-01',
  // Minimal stand-in for the real accent/case-insensitive normalizer, enough
  // to exercise useFilter's filtering branches in the hooks tests below.
  cleanForComparison: (v) => String(v ?? '').toLowerCase(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

/**
 * Test helper to check if a component renders safely with edge case props
 */
const testNullSafety = (Component, componentName, testCases) => {
  describe(`${componentName} - Null Safety`, () => {
    testCases.forEach(({ description, props }) => {
      it(`should not crash when ${description}`, () => {
        expect(() => {
          render(<Component {...props} />);
        }).not.toThrow();
      });
    });
  });
};

// =============================================================================
// FORM COMPONENTS TESTS
// =============================================================================

describe('Form Components - Null Safety', () => {

  describe('Components with array props', () => {

    it('Tags: should handle undefined/null options and value', async () => {
      const { Tags } = await import('lib/components/formats/Tags/index.jsx');

      const testCases = [
        { props: {}, description: 'no props' },
        { props: { value: undefined }, description: 'undefined value' },
        { props: { value: null }, description: 'null value' },
        { props: { value: [] }, description: 'empty array value' },
        { props: { options: undefined }, description: 'undefined options' },
        { props: { options: null }, description: 'null options' },
        { props: { value: ['tag1'], options: undefined }, description: 'value but undefined options' },
      ];

      testCases.forEach(({ props, description }) => {
        expect(() => render(<Tags {...props} />), description).not.toThrow();
      });
    });

    it('Checker: should handle undefined/null currentValue', async () => {
      const { Checker } = await import('lib/components/form/Checker/index.jsx');

      expect(() => render(<Checker options={[]} />)).not.toThrow();
      expect(() => render(<Checker options={['a', 'b']} multiple />)).not.toThrow();
      expect(() => render(<Checker />)).not.toThrow();
    });

    it('RadioBar: should handle undefined/null options', async () => {
      const { RadioBar } = await import('lib/components/form/RadioBar/index.jsx');

      expect(() => render(<RadioBar />)).not.toThrow();
      expect(() => render(<RadioBar options={undefined} />)).not.toThrow();
      expect(() => render(<RadioBar options={null} />)).not.toThrow();
      expect(() => render(<RadioBar options={[]} />)).not.toThrow();
    });

    it('Select: should handle undefined/null options', async () => {
      const { Select } = await import('lib/components/form/Select/index.jsx');

      expect(() => render(<Select />)).not.toThrow();
      expect(() => render(<Select options={undefined} />)).not.toThrow();
      expect(() => render(<Select options={[]} />)).not.toThrow();
    });

    it('Array: should handle undefined/null value', async () => {
      const { Array: ArrayComponent } = await import('lib/components/form/Array/index.jsx');

      expect(() => render(<ArrayComponent />)).not.toThrow();
      expect(() => render(<ArrayComponent value={undefined} />)).not.toThrow();
      expect(() => render(<ArrayComponent value={null} />)).not.toThrow();
      expect(() => render(<ArrayComponent value={[]} />)).not.toThrow();
    });
  });

  describe('Uploader components', () => {

    it('PhotosUploader: should handle undefined/null value', async () => {
      const { PhotosUploader } = await import('lib/components/form/PhotosUploader/index.jsx');

      expect(() => render(<PhotosUploader />)).not.toThrow();
      expect(() => render(<PhotosUploader value={undefined} multiple />)).not.toThrow();
      expect(() => render(<PhotosUploader value={null} />)).not.toThrow();
      expect(() => render(<PhotosUploader value={[]} multiple />)).not.toThrow();
    });

    it('AudiosUploader: should handle undefined/null value', async () => {
      const { AudiosUploader } = await import('lib/components/form/AudiosUploader/index.jsx');

      expect(() => render(<AudiosUploader />)).not.toThrow();
      expect(() => render(<AudiosUploader value={undefined} multiple />)).not.toThrow();
      expect(() => render(<AudiosUploader value={null} />)).not.toThrow();
    });

    it('VideosUploader: should handle undefined/null value', async () => {
      const { VideosUploader } = await import('lib/components/form/VideosUploader/index.jsx');

      expect(() => render(<VideosUploader />)).not.toThrow();
      expect(() => render(<VideosUploader value={undefined} multiple />)).not.toThrow();
      expect(() => render(<VideosUploader value={null} />)).not.toThrow();
    });

    it('FilesUploader: should handle undefined/null value', async () => {
      const { FilesUploader } = await import('lib/components/form/FilesUploader/index.jsx');

      expect(() => render(<FilesUploader />)).not.toThrow();
      expect(() => render(<FilesUploader value={undefined} multiple />)).not.toThrow();
      expect(() => render(<FilesUploader value={null} />)).not.toThrow();
    });
  });

  describe('Components with nested property access', () => {

    it('Gps: should handle undefined/null currentValue', async () => {
      const { Gps } = await import('lib/components/form/Gps/index.jsx');

      expect(() => render(<Gps />)).not.toThrow();
      expect(() => render(<Gps value={undefined} />)).not.toThrow();
      expect(() => render(<Gps value={null} />)).not.toThrow();
    });

    it('Calendar: should handle edge cases', async () => {
      const { Calendar } = await import('lib/components/form/Calendar/index.jsx');

      expect(() => render(<Calendar />)).not.toThrow();
      expect(() => render(<Calendar value={undefined} />)).not.toThrow();
      expect(() => render(<Calendar items={undefined} />)).not.toThrow();
    });

    // PlainCalendar is intentionally NOT tested here: the global hook
    // mocks in this file (useVariantMerger -> variantProps:{},
    // useStates -> states:{}) drop the component's initialStates and
    // crash on `months[month-1].days` before exercising the actual
    // contract. See PlainCalendar/index.test.jsx for a real smoke
    // render, and tests/builtBundle.test.jsx (test:build) for the
    // minified-bundle reproduction.
  });
});

// =============================================================================
// NAVIGATION COMPONENTS TESTS
// =============================================================================

describe('Navigation Components - Null Safety', () => {

  it('Sidebar: should handle undefined/null links', async () => {
    const { Sidebar } = await import('lib/components/navigation/Sidebar/index.jsx');

    expect(() => render(<Sidebar />)).not.toThrow();
    expect(() => render(<Sidebar links={undefined} />)).not.toThrow();
    expect(() => render(<Sidebar links={null} />)).not.toThrow();
    expect(() => render(<Sidebar links={[]} />)).not.toThrow();
  });
});

// =============================================================================
// HOOKS TESTS
// =============================================================================

// Hooks must be exercised inside a React render: renderHook provides that.
// The lib/hooks mock above stubs useStates so useFormBuilder runs without a store.

describe('Hooks - Null Safety', () => {
  it('useFormBuilder: should handle undefined/null/empty form', async () => {
    const { useFormBuilder } = await import('lib/hooks/local/useFormBuilder/index.jsx');

    // No crash on the degenerate inputs, and buildForm always returns an array.
    for (const form of [undefined, null, []]) {
      let api;
      expect(() => {
        api = renderHook(() => useFormBuilder(form)).result.current;
      }, `useFormBuilder(${JSON.stringify(form)}) threw`).not.toThrow();
      expect(Array.isArray(api.buildForm())).toBe(true);
      expect(api.buildForm()).toHaveLength(0);
    }
  });

  it('useFormBuilder: builds one node per top-level component', async () => {
    const { useFormBuilder } = await import('lib/hooks/local/useFormBuilder/index.jsx');

    const form = [
      { id: 'a', type: 'varchar' },
      { id: 'b', type: 'text' },
    ];
    const { result } = renderHook(() => useFormBuilder(form));
    expect(result.current.buildForm()).toHaveLength(2);
  });
});

// =============================================================================
// UTILITY FUNCTIONS TESTS
// =============================================================================

describe('Utility Functions - Null Safety', () => {
  it('useFilter: should handle undefined/null/empty attributes without crashing', async () => {
    const { useFilter } = await import('lib/utils/functions/filters/smart.js');

    for (const attributes of [undefined, null, {}]) {
      let filter;
      expect(() => {
        filter = useFilter(attributes);
      }, `useFilter(${JSON.stringify(attributes)}) threw`).not.toThrow();

      expect(typeof filter.searchBarFilter).toBe('function');
      expect(typeof filter.smartFilters).toBe('function');
      expect(filter.smartFiltersStates).toEqual({});

      // The returned filter functions must also be safe on an empty list.
      expect(filter.smartFilters([], {})).toEqual([]);
      expect(filter.searchBarFilter([], 'foo', true)).toEqual([]);
    }
  });

  it('useFilter: smartFilters applies an inclusive interval filter', async () => {
    const { useFilter } = await import('lib/utils/functions/filters/smart.js');

    const { smartFilters } = useFilter({ age: { type: 'int' } });
    const list = [{ age: 10 }, { age: 25 }, { age: 40 }];

    const result = smartFilters(list, {
      age: { inclusive: { interval: { min: 20, max: 30 } }, exclusive: null },
    });

    expect(result).toEqual([{ age: 25 }]);
  });

  it('useFilter: searchBarFilter narrows the list by a searchable attribute', async () => {
    const { useFilter } = await import('lib/utils/functions/filters/smart.js');

    const { searchBarFilter } = useFilter({ name: { type: 'varchar', searchall: true } });
    const list = [{ name: 'Alice' }, { name: 'Bob' }];

    // filteredValue truthy -> filtering active; case-insensitive via the mock.
    expect(searchBarFilter(list, 'ali', true)).toEqual([{ name: 'Alice' }]);
    // filteredValue falsy -> list returned untouched.
    expect(searchBarFilter(list, 'ali', false)).toEqual(list);
  });
});
