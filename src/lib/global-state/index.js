import { userReducer, globalReducer } from "./slices";

export const reducers = {
  user: userReducer,
  global: globalReducer
};

export * from "./slices";