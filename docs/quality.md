# JavaScript/React - Defensive Programming Guide

This document explains the code security improvements made to prevent `TypeError: can't access property "X", Y is undefined` errors.

## The Problem

In JavaScript, accessing a property or calling a method on `undefined` or `null` throws a runtime error:

```javascript
// These will crash if the variable is undefined/null:
myArray.map(...)        // TypeError: can't access property "map", myArray is undefined
myObject.property       // TypeError: can't access property "property", myObject is undefined
myArray[0].name         // TypeError: can't access property "name", myArray[0] is undefined
myArray.length          // TypeError: can't access property "length", myArray is undefined
```

## Solutions Applied

### 1. Nullish Coalescing Operator (`??`)

Provides a default value when the left operand is `null` or `undefined`.

```javascript
// BEFORE (unsafe)
currentValue.map(item => ...)

// AFTER (safe)
(currentValue ?? []).map(item => ...)
```

**When to use:** Before calling array methods (`.map()`, `.filter()`, `.slice()`, `.includes()`, etc.)

### 2. Optional Chaining (`?.`)

Stops evaluation and returns `undefined` if the value before `?.` is `null` or `undefined`.

```javascript
// BEFORE (unsafe)
months[month - 1].name
currentValue[0]

// AFTER (safe)
months?.[month - 1]?.name
currentValue?.[0]
```

**When to use:** When accessing nested properties or array elements that might not exist.

### 3. Combined Pattern for `.length`

```javascript
// BEFORE (unsafe)
currentValue.length < min

// AFTER (safe)
(currentValue?.length ?? 0) < min
```

### 4. Guard Clauses for Index Access

```javascript
// BEFORE (unsafe)
newValue[selectedIndex][prop] = value;

// AFTER (safe)
if (newValue[selectedIndex]) {
    newValue[selectedIndex][prop] = value;
}
```

### 5. Safe Method Calls on Refs

```javascript
// BEFORE (unsafe)
audioRefs.current[index].pause();
audioRefs.current[index].currentTime = 0;

// AFTER (safe)
audioRefs.current?.[index]?.pause?.();
if (audioRefs.current?.[index]) {
    audioRefs.current[index].currentTime = 0;
}
```

## Common Patterns

### Safe Array Iteration

```javascript
// Pattern 1: Nullish coalescing
{(items ?? []).map((item, index) => <Item key={index} {...item} />)}

// Pattern 2: Conditional rendering + nullish coalescing
{!isEmpty(items) && (items ?? []).map(...)}

// Pattern 3: Early return in functions
const items = data ?? [];
if (items.length === 0) return null;
return items.map(...);
```

### Safe Object Property Access

```javascript
// Access nested property
const name = user?.profile?.name ?? "Anonymous";

// Access array element property
const firstItemName = items?.[0]?.name;

// Access with fallback
const color = options?.find(opt => opt.value === tag)?.color ?? "default";
```

### Safe Array Spread

```javascript
// BEFORE (unsafe)
const newArray = [...currentValue, newItem];

// AFTER (safe)
const newArray = [...(currentValue ?? []), newItem];
```

### Safe Slice Operations

```javascript
// BEFORE (unsafe)
const newArray = [...array.slice(0, index), ...array.slice(index + 1)];

// AFTER (safe)
const safeArray = array ?? [];
const newArray = [...safeArray.slice(0, index), ...safeArray.slice(index + 1)];
```

## Files Modified

| File | Issues Fixed |
|------|--------------|
| `Tags/index.jsx` | `=` vs `===` bug, unsafe `.find().color` |
| `PhotosUploader/index.jsx` | `.map()`, `.slice()`, `.length`, index access |
| `AudiosUploader/index.jsx` | `.map()`, `.slice()`, `.length`, refs access |
| `VideosUploader/index.jsx` | `.map()`, `.slice()`, `.length`, refs access |
| `FilesUploader/index.jsx` | `.slice()`, index access |
| `Checker/index.jsx` | `.includes()`, `.length` |
| `RadioBar/index.jsx` | `options.map()` |
| `Array/index.jsx` | spread, `.slice()` |
| `Gps/index.jsx` | `currentValue[0]`, `currentValue[1]` |
| `Calendar/index.jsx` | `months[month-1]` access |
| `AddressInput/index.jsx` | `json.map()` |
| `Sidebar/index.jsx` | `links.map()` |
| `useFormBuilder/index.jsx` | `children.map()`, `tabs.map()`, `form.map()` |
| `filters/smart.js` | `attributes[key]` access |

## Best Practices

1. **Always initialize state with appropriate defaults**
   ```javascript
   const [items, setItems] = useState([]);  // Not useState()
   ```

2. **Use default parameter values**
   ```javascript
   const Component = ({ options = [], links = [] }) => { ... }
   ```

3. **Validate props with PropTypes or TypeScript**

4. **Use `isEmpty()` from lodash for conditional rendering**
   ```javascript
   {!isEmpty(items) && items.map(...)}
   ```

5. **Consider using TypeScript** for compile-time type checking

## Debugging Tips

When you see `can't access property "X", Y is undefined`:

1. Identify which variable is `undefined` (the one before the property access)
2. Trace back to find why it's `undefined` (API response, state initialization, prop not passed)
3. Add appropriate defensive code (`??`, `?.`, or guards)
4. Consider if the component should render at all when data is missing

---

## Automated Tools

### ESLint Configuration

ESLint is configured with rules to catch these errors at development time.

**File:** `eslint.config.js`

```javascript
// Safety rules to prevent undefined/null access errors
'no-unsafe-optional-chaining': 'error',
'array-callback-return': ['error', { allowImplicit: true }],
'no-prototype-builtins': 'error',
'eqeqeq': ['error', 'always', { null: 'ignore' }],
'no-implicit-coercion': 'warn',
```

| Rule | Purpose |
|------|---------|
| `no-unsafe-optional-chaining` | Prevents dangerous uses of `?.` that could still fail |
| `array-callback-return` | Forces return statements in `.map()`, `.filter()`, etc. |
| `no-prototype-builtins` | Prevents bugs with `obj.hasOwnProperty()` |
| `eqeqeq` | Forces `===` instead of `==` (prevents bugs like `=` vs `===`) |
| `no-implicit-coercion` | Warns about implicit type conversions |

**Usage:**
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix when possible
```

### Vitest - Unit Tests

Unit tests verify components don't crash with edge-case props (undefined, null, empty arrays).

**Configuration:** `vitest.config.js`

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/lib/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});
```

**Test file:** `src/lib/tests/nullSafety.test.jsx`

Tests each component with:
- `undefined` props
- `null` props
- Empty arrays `[]`
- Missing required props

**Usage:**
```bash
npm run test          # Watch mode (re-runs on file changes)
npm run test:run      # Run once
npm run test:safety   # Run only null safety tests
npm run test:coverage # Run with coverage report
```

### Example Test

```javascript
it('PhotosUploader: should handle undefined/null value', async () => {
  const { PhotosUploader } = await import('lib/components/form/PhotosUploader');

  // These should NOT throw errors
  expect(() => render(<PhotosUploader />)).not.toThrow();
  expect(() => render(<PhotosUploader value={undefined} multiple />)).not.toThrow();
  expect(() => render(<PhotosUploader value={null} />)).not.toThrow();
  expect(() => render(<PhotosUploader value={[]} multiple />)).not.toThrow();
});
```

### Writing New Tests

When adding a new component, add a test to `nullSafety.test.jsx`:

```javascript
it('MyComponent: should handle undefined/null props', async () => {
  const { MyComponent } = await import('lib/components/MyComponent');

  // Test with no props
  expect(() => render(<MyComponent />)).not.toThrow();

  // Test with undefined array prop
  expect(() => render(<MyComponent items={undefined} />)).not.toThrow();

  // Test with null object prop
  expect(() => render(<MyComponent data={null} />)).not.toThrow();

  // Test with empty array
  expect(() => render(<MyComponent items={[]} />)).not.toThrow();
});
```

### CI/CD Integration

Add these commands to your CI pipeline:

```yaml
# .gitlab-ci.yml or .github/workflows/ci.yml
test:
  script:
    - npm ci
    - npm run lint
    - npm run test:run
```

---

## Migration to TypeScript (Optional)

For even stronger guarantees, consider migrating to TypeScript:

### Progressive Migration

1. **Add TypeScript:**
   ```bash
   npm install -D typescript @types/react @types/react-dom
   ```

2. **Create `tsconfig.json`:**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "jsx": "react-jsx",
       "moduleResolution": "node",
       "allowJs": true,
       "checkJs": true
     }
   }
   ```

3. **Enable checking in JS files:**
   Add `// @ts-check` at the top of `.js` files to enable type checking without renaming.

4. **Rename files progressively:**
   `.jsx` → `.tsx`, `.js` → `.ts`

### TypeScript Example

```typescript
interface PhotosUploaderProps {
  value?: Photo[] | null;  // Explicitly nullable
  multiple?: boolean;
  onChange?: (value: Photo[]) => void;
}

const PhotosUploader: React.FC<PhotosUploaderProps> = ({
  value,
  multiple = false,
  onChange = () => {},
}) => {
  // TypeScript will warn if you use value.map() without checking
  const photos = value ?? [];
  return photos.map(...);
};
```

---

## References

- [MDN - Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [MDN - Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
