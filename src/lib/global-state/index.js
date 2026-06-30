import { globalReducer } from "./slices/globalSlice";

// Public global-state surface. Keep index.js (dev / Storybook) and export.js
// (library build) IDENTICAL: a consumer importing { reducers }, { globalReducer }
// or any user-slice action from the npm package must see exactly what Storybook
// sees. Enforced by barrelExports.test.jsx.
export const reducers = {
  global: globalReducer
};

export * from "./slices/globalSlice";
export * from "./slices/userSlice";
