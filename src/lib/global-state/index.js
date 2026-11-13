import { globalReducer } from "./slices/globalSlice";

// Public global-state surface. Keep index.js (dev / Storybook) and export.js
// (library build) IDENTICAL: a consumer importing { reducers }, { globalReducer }
// from the npm package must see exactly what Storybook
// sees. Enforced by barrelExports.test.jsx.
export const reducers = {
  global: globalReducer
};

export * from "./slices/globalSlice";
// The user slice is not public: the signed-in user lives in the global
// states (useApi), and only the legacy useApiTest2 hooks import the slice
// directly.
