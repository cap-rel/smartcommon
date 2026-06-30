import { globalReducer } from "./slices/globalSlice";

// MUST stay identical to ./index.js (the dev/Storybook barrel). See the note
// there. Enforced by barrelExports.test.jsx.
export const reducers = {
  global: globalReducer
};

export * from "./slices/globalSlice";
export * from "./slices/userSlice";
