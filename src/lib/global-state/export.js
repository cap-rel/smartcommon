import { globalReducer } from "./slices/globalSlice";

// MUST stay identical to ./index.js (the dev/Storybook barrel). See the note
// there. Enforced by barrelExports.test.jsx.
export const reducers = {
  global: globalReducer
};

export * from "./slices/globalSlice";
// The user slice is not public: the signed-in user lives in the global
// states (useApi), and only the legacy useApiTest2 hooks import the slice
// directly.
